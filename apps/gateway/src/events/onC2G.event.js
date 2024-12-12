import config from '@peekaboo-ssr/config/gateway';
import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import { routeG2SHandler } from '../routes/packet.routes.js';
import {
  deleteUserToConnectClients,
  exitUserFromSessionService,
} from '../sessions/close.session.js';

class C2GEventHandler extends BaseEvent {
  onConnection(socket, server) {
    console.log(
      `Game Client connected from: ${socket.remoteAddress}:${socket.remotePort}`,
    );
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    server.connectClients[clientKey] = {
      socket: socket,
      sequence: 1,
      gameSessionKey: null,
    };
    socket.buffer = Buffer.alloc(0);
  }

  // 게이트웨이에서는 헤더 검증 및 라우팅까지만 수행.
  // 라우팅 시 어떤 유저가 보낸건지 저장하여 수행하도록 함.
  async onData(socket, data, server = null) {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (
      socket.buffer.length >=
      config.header.client.typeLength + config.header.client.versionLength
    ) {
      let offset = 0;
      const packetType = socket.buffer.readUint16BE(offset);
      offset += config.header.client.typeLength;

      const versionLength = socket.buffer.readUint8(offset);
      offset += config.header.client.versionLength;

      const totalHeaderLength =
        config.header.client.typeLength +
        config.header.client.versionLength +
        versionLength +
        config.header.client.sequenceLength +
        config.header.client.payloadLength;

      if (socket.buffer.length < totalHeaderLength) {
        break;
      }

      const version = socket.buffer
        .subarray(offset, offset + versionLength)
        .toString('utf-8');
      offset += versionLength;

      if (version !== config.version) {
        console.error(`버전 에러: ${version}`);
      }

      const sequence = socket.buffer.readUint32BE(offset);
      offset += config.header.client.sequenceLength;

      const payloadLength = socket.buffer.readUint32BE(offset);
      offset += config.header.client.payloadLength;

      const totalPacketLength = totalHeaderLength + payloadLength;
      if (socket.buffer.length < totalPacketLength) {
        break;
      } else {
        const payloadBuffer = socket.buffer.subarray(
          offset,
          offset + payloadLength,
        );
        offset += payloadLength;
        try {
          socket.buffer = socket.buffer.subarray(offset);
          await routeG2SHandler(
            socket,
            packetType,
            payloadLength,
            payloadBuffer,
            server,
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  onEnd(socket, server) {
    // 유저의 세션을 삭제하도록 함.
    // 1. 세션 서비스에서 해당 유저를 모두 삭제
    // 2. 게이트웨이의 connectClients 에서 해당 유저 삭제
    // 3. connectClients 해당 유저가 플레이중인 게임이 있었다면 해당 게임에 삭제 요청
    // 4. 데디케이티드 서버에 해당 유저 Disconnected 알림
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    exitUserFromSessionService(server.pubSubManager, clientKey);
    deleteUserToConnectClients(server, clientKey);
    console.log('Client Disconnected', socket.remoteAddress, socket.remotePort);
  }

  onError(socket, err, server) {
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`;
    exitUserFromSessionService(server.pubSubManager, clientKey);
    deleteUserToConnectClients(server, clientKey);
    console.log('Client Disconnected', socket.remoteAddress, socket.remotePort);
  }
}

export default C2GEventHandler;
