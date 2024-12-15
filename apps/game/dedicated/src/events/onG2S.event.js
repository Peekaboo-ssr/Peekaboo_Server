import { config } from '../config/config.js';
import { PACKET_MAPS } from '../constants/packet.js';
import { parsePacketG2S } from '../utils/packet/parse.packet.js';
import { PACKET_TYPE } from '../constants/packet.js';

class G2SEventHandler {
  onConnection(socket, server) {
    console.log(
      `Gate connected from: ${socket.remoteAddress}:${socket.remotePort}`,
    );

    // 게임 인스턴스에 게이트 소켓을 할당
    server.game.socket = socket;

    socket.buffer = Buffer.alloc(0);
  }

  async onData(socket, data, server) {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (
      socket.buffer.length >=
      config.header.route.typeLength + config.header.route.clientKeyLength
    ) {
      let offset = 0;
      const packetType = socket.buffer.readUint16BE(offset);
      offset += config.header.route.typeLength;

      const clientKeyLength = socket.buffer.readUInt8(offset);
      offset += config.header.route.clientKeyLength;

      const clientKey = socket.buffer
        .subarray(offset, offset + clientKeyLength)
        .toString();
      offset += clientKeyLength;

      const totalHeaderLength =
        config.header.route.typeLength +
        config.header.route.clientKeyLength +
        clientKeyLength;

      if (socket.buffer.length < totalHeaderLength) {
        break;
      }

      const payloadLength = socket.buffer.readUint32BE(offset);
      offset += config.header.route.payloadLength;
      const totalPacketLength = totalHeaderLength + payloadLength;

      if (socket.buffer.length < totalPacketLength) {
        break;
      }
      const payloadBuffer = socket.buffer.subarray(
        offset,
        offset + payloadLength,
      );
      offset += payloadLength;
      try {
        const payload = parsePacketG2S(packetType, payloadBuffer);
        socket.buffer = socket.buffer.subarray(offset);

        // Recv Logging Test
        // PingResponse, PlayerMoveRequest, GhostMoveRequest는 제외
        if (
          packetType !== PACKET_TYPE.game.PlayerMoveRequest &&
          packetType !== PACKET_TYPE.game.GhostMoveRequest &&
          packetType !== PACKET_TYPE.game.PingResponse &&
          packetType !== PACKET_TYPE.game.PlayerStateChangeRequest
        )
          console.log(
            `#@!RECV!@# PacketType : ${
              PACKET_MAPS.client[packetType]
            } => Payload ${JSON.stringify(payload)}`,
          );

        const handler = server.getClientHandlerByPacketType(packetType);

        await handler({ socket, clientKey, payload, server });
      } catch (e) {
        console.error(e);
      }
    }
  }

  onEnd(socket) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }

  onError(socket, err) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }
}

export default G2SEventHandler;
