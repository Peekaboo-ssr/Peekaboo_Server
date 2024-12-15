import config from '@peekaboo-ssr/config/distributor';
import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import { sendInfo } from '../notifications/connection.notification.js';
import { serviceMap } from '../source/connection.source.js';
import { parsePacketS2S } from '@peekaboo-ssr/utils/parsePacket';
import { findServiceByReceiver } from '../utils/routes/find.routes.js';

class S2DEventHandler extends BaseEvent {
  onConnection(socket) {
    console.log(
      `Service Client connected from: ${socket.remoteAddress}:${socket.remotePort}`,
    );
    sendInfo(socket);
    socket.buffer = Buffer.alloc(0);
  }

  async onData(socket, data, server = null) {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (socket.buffer.length >= config.header.service.typeLength) {
      let offset = 0;
      const packetType = socket.buffer.readUint16BE(offset);
      offset += config.header.service.typeLength;

      const senderLength = socket.buffer.readUInt8(offset);
      offset += config.header.service.senderLength;

      const sender = socket.buffer
        .subarray(offset, offset + senderLength)
        .toString();
      offset += senderLength;

      const receiverLength = socket.buffer.readUInt8(offset);
      offset += config.header.service.receiverLength;

      const receiver = socket.buffer
        .subarray(offset, offset + receiverLength)
        .toString();
      offset += receiverLength;

      const payloadLength = socket.buffer.readUint32BE(offset);
      offset += config.header.service.payloadLength;

      const totalPacketLength = offset + payloadLength;

      if (socket.buffer.length < totalPacketLength) {
        break;
      }

      const payloadBuffer = socket.buffer.subarray(
        offset,
        offset + payloadLength,
      );
      const buffer = socket.buffer.subarray(0, totalPacketLength);
      socket.buffer = socket.buffer.subarray(totalPacketLength);

      try {
        if (receiver === 'distributor') {
          const handler = server.getServiceHandlerByPacketType(packetType);
          const payload = parsePacketS2S(packetType, payloadBuffer);
          await handler(socket, payload);
        } else {
          // 보내야 할 서비스 라우팅하기
          console.log(packetType);
          const receiverSocket = findServiceByReceiver(receiver);

          if (receiverSocket === null) {
            console.error('라우팅할 곳 찾지 못함!!');
            return;
          } else {
            receiverSocket.write(buffer);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  onEnd(socket) {
    const key = socket.remoteAddress + ':' + socket.remotePort;
    console.log('서비스 연결 끊김...', socket.remoteAddress, socket.remotePort);
    delete serviceMap[key];
    sendInfo();
  }

  onError(socket, err) {
    const key = socket.remoteAddress + ':' + socket.remotePort;
    console.log('서비스 연결 끊김...', socket.remoteAddress, socket.remotePort);
    delete serviceMap[key];
    sendInfo();
  }
}

export default S2DEventHandler;
