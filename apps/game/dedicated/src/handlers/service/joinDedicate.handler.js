import User from '../../classes/models/user.class.js';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';
import { sendJoinRoomResponse } from '../../response/room/room.response.js';
import { joinRoomNotification } from '../../notifications/room/room.notification.js';

export const joinDedicatedHandler = (server, payload) => {
  console.log('joinDedicated.....');
  const { clientKey, userId } = payload;

  try {
    const user = new User(userId, clientKey);
    // 게임에 유저 등록
    server.game.addUser(user, false);

    // 유저 등록완료를 게이트웨이에 알리기
    const payloadForGate = {
      dedicateKey: server.context.host + ':' + server.context.port,
      clientKey,
      userId,
    };
    const packetForGate = createPacketS2S(
      config.servicePacket.ConnectDedicatedRequest,
      'dedicated',
      'gateway',
      payloadForGate,
    );
    server.clientToDistributor.write(packetForGate);

    // 유저 등록완료를 클라이언트에 알리기
    sendJoinRoomResponse(server.game, clientKey, true);
    joinRoomNotification(server.game, user.id);
  } catch (e) {
    sendJoinRoomResponse(server.game, clientKey, false);
  }
};
