import User from '../../classes/models/user.class.js';
import { createPacketS2S } from '../../utils/packet/create.packet.js';
import { config } from '../../config/config.js';
import { sendJoinRoomResponse } from '../../response/room/room.response.js';

export const joinDedicatedHandler = (server, payload) => {
  const { clientKey, userId } = payload;

  const user = new User(userId, clientKey);

  // 게임에 유저 등록
  server.game.addUser(user, false);

  // 유저 등록완료를 게이트웨이에 알리기
  const payloadForGate = {
    dedicateKey: server.context.host + ':' + server.context.port,
    clientKey,
  };
  const packetForGate = createPacketS2S(
    config.service.ConnectDedicateRequest,
    'dedicated',
    'gateway',
    payloadForGate,
  );
  server.clientToDistributor.write(packetForGate);

  // 유저 등록완료를 클라이언트에 알리기
  sendJoinRoomResponse(server.game.socket, server.game, clientKey);
};
