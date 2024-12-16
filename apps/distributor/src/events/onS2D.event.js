import config from '@peekaboo-ssr/config/distributor';
import { sendInfo } from '../notifications/connection.notification.js';
import { serviceMap } from '../source/connection.source.js';
import { parsePacketS2S } from '@peekaboo-ssr/utils/parsePacket';
import { findServiceByReceiver } from '../utils/routes/find.routes.js';

class S2DEventHandler {
  onConnection(socket) {
    console.log(
      `Service Client connected from: ${socket.remoteAddress}:${socket.remotePort}`,
    );
    // 이전 코드: 즉시 sendInfo 호출
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
        console.log('Received packet type:', packetType);
        const receiverSocket = findServiceByReceiver(receiver);

        if (!receiverSocket) {
          const handler = server.getServiceHandlerByPacketType(packetType);
          if (!handler) {
            console.error('No handler found for packet type:', packetType);
            continue;
          }

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
        console.error('Error processing packet:', e);
        console.error(e.stack); // 새로운 코드: 스택 트레이스 추가
      }
    }
  }

  onEnd(socket) {
    // 이전 코드
    /*
    const key = socket.remoteAddress + ':' + socket.remotePort;
    console.log('서비스 연결 끊김...', socket.remoteAddress, socket.remotePort);
    delete serviceMap[key];
    sendInfo();
    */

    // 새로운 코드: serviceMap 구조에 맞게 수정
    const socketPort = socket.remotePort;
    let removed = false;

    // microservices에서 검색
    Object.keys(serviceMap.microservices).forEach((key) => {
      if (serviceMap.microservices[key].socket === socket) {
        delete serviceMap.microservices[key];
        removed = true;
      }
    });

    // dedicates에서 검색
    Object.keys(serviceMap.dedicates).forEach((key) => {
      if (serviceMap.dedicates[key].socket === socket) {
        delete serviceMap.dedicates[key];
        removed = true;
      }
    });

    console.log('서비스 연결 끊김...', socket.remoteAddress, socket.remotePort);
    if (removed) {
      sendInfo();
    }
  }

  onError(socket, err) {
    console.log(
      '서비스 연결 오류:',
      socket.remoteAddress,
      socket.remotePort,
      err,
    );
    this.onEnd(socket); // 새로운 코드: 에러 처리를 onEnd와 동일하게 처리
  }
}

export default S2DEventHandler;
