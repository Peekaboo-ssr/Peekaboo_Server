import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import config from '@peekaboo-ssr/config/gateway';
import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { getSocketByClientKey } from '../sessions/find.session.js';
import { sendPacketToClient } from '../response/client.response.js';

class S2GEventHandler extends BaseEvent {
  onConnection(server) {
    console.log(
      `Service connected from: `,
      server.options.host,
      server.options.port,
    );
    server.buffer = Buffer.alloc(0);
  }

  async onData(server, data, clients) {
    server.buffer = Buffer.concat([server.buffer, data]);

    while (
      server.buffer.length >=
      config.header.route.typeLength + config.header.route.clientKeyLength
    ) {
      let offset = 0;
      const packetType = server.buffer.readUInt16BE(offset);
      offset += config.header.route.typeLength;

      const clientKeyLength = server.buffer.readUInt8(offset);
      offset += config.header.route.clientKeyLength;

      const clientKey = server.buffer
        .subarray(offset, offset + clientKeyLength)
        .toString();
      offset += clientKeyLength;

      const totalHeaderLength =
        config.header.route.typeLength +
        config.header.route.clientKeyLength +
        clientKeyLength;

      if (server.buffer.length < totalHeaderLength) {
        break;
      }

      const payloadLength = server.buffer.readUint32BE(offset);
      offset += config.header.route.payloadLength;
      const totalPacketLength = totalHeaderLength + payloadLength;

      if (server.buffer.length < totalPacketLength) {
        break;
      }
      const payloadBuffer = server.buffer.subarray(
        offset,
        offset + payloadLength,
      );
      offset += payloadLength;
      try {
        server.buffer = server.buffer.subarray(offset);
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

  onEnd(server) {
    console.log(
      'Disconnected Service: ',
      server.options.host,
      server.options.port,
    );
  }

  onError(server, err) {
    console.log(
      'Disconnected Service: ',
      server.options.host,
      server.options.port,
    );
  }
}

export default S2GEventHandler;
