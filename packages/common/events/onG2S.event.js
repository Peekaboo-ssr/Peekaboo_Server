import config from '@peekaboo-ssr/config/shared';
import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import { parsePacketG2S } from '@peekaboo-ssr/utils/parsePacket';

class G2SEventHandler extends BaseEvent {
  onConnection(socket, server) {
    console.log(
      `Gate connected from: ${socket.remoteAddress}:${socket.remotePort}`,
    );
    this.isConnected = true;
    if (server.context.name === 'dedicated') {
      server.game.socket = socket;
    } else {
      server.gateSocket = socket;
    }

    socket.buffer = Buffer.alloc(0);
  }

  async onData(socket, data, server) {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (
      socket.buffer.length >=
      config.header.client.typeLength + config.header.client.clientKeyLength
    ) {
      let offset = 0;
      const packetType = socket.buffer.readUint16BE(offset);
      offset += config.header.client.typeLength;

      const clientKeyLength = socket.buffer.readUInt8(offset);
      offset += config.header.client.clientKeyLength;

      const clientKey = socket.buffer
        .subarray(offset, offset + clientKeyLength)
        .toString();
      offset += clientKeyLength;

      const totalHeaderLength =
        config.header.client.typeLength +
        config.header.client.clientKeyLength +
        clientKeyLength;

      if (socket.buffer.length < totalHeaderLength) {
        break;
      }

      const payloadLength = socket.buffer.readUint32BE(offset);
      offset += config.header.client.payloadLength;
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

        if (server.context.name === 'dedicated') {
          if (
            packetType !== clientPacket.dedicated.PlayerMoveRequest &&
            packetType !== clientPacket.dedicated.GhostMoveRequest &&
            packetType !== clientPacket.dedicated.PingResponse &&
            packetType !== clientPacket.dedicated.PlayerStateChangeRequest
          )
            console.log(
              `#@!RECV!@# PacketType : ${
                PACKET_MAPS.client[packetType]
              } => Payload ${JSON.stringify(payload)}`,
            );
        }

        const handler = server.getClientHandlerByPacketType(packetType);

        await handler(socket, clientKey, payload, server);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onEnd(socket, server) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }

  onError(socket, err, server) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }
}

export default G2SEventHandler;
