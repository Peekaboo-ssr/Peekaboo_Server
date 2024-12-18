import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import config from '@peekaboo-ssr/config/gateway';
import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { getSocketByClientKey } from '../sessions/find.session.js';
import { sendPacketToClient } from '../response/client.response.js';

class S2GEventHandler extends BaseEvent {
  onConnection(socket) {
    console.log(
      `Service connected from: `,
      socket.options.host,
      socket.options.port,
    );
    socket.buffer = Buffer.alloc(0);
  }

  async onData(socket, data, clients) {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (
      socket.buffer.length >=
      config.header.route.typeLength + config.header.route.clientKeyLength
    ) {
      let offset = 0;
      const packetType = socket.buffer.readUInt16BE(offset);
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
        socket.buffer = socket.buffer.subarray(offset);
        // 여기서 클라이언트를 찾아서 보내는 작업 하면 될 것 같음.
        const client = getSocketByClientKey(clients, clientKey);
        if (!client) {
          throw new CustomError(errorCodesMap.SOCKET_ERROR);
        }
        sendPacketToClient(packetType, client, payloadBuffer);
      } catch (e) {
        handleError(e);
      }
    }
  }

  onEnd(socket) {
    console.log(
      'Disconnected Service: ',
      socket.remoteAddress,
      socket.remotePort,
    );
  }

  onError(socket, err) {
    console.log(
      'Disconnected Service: ',
      socket.remoteAddress,
      socket.remotePort,
    );
  }
}

export default S2GEventHandler;
