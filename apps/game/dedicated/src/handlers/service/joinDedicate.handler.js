import User from '../../classes/models/user.class.js';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';
import { sendJoinRoomResponse } from '../../response/room/room.response.js';
import { joinRoomNotification } from '../../notifications/room/room.notification.js';
import { SUBMISSION_DURATION } from '../../constants/game.js';
import { MAX_PLAYER } from '../../constants/game.js';

export const joinDedicatedHandler = (server, payload) => {
  console.log('joinDedicated.....');
  const { clientKey, userId, nickname } = payload;

  try {
    // 4인 초과라면 실패
    if (server.game.users.length >= MAX_PLAYER) {
      console.log('최대 인원이므로 참가가 불가합니다.');
      sendJoinRoomResponse(server.game, clientKey, false);
      return;
    }

    // 게임 준비 단계 / 서브미션이 첫번째에 첫 날인지 검증
    if (
      server.game.state !== config.clientState.gameState.PREPARE &&
      server.game.day !== SUBMISSION_DURATION &&
      server.game.submissionId !== server.game.gameAssets.submission.data[0].Id
    ) {
      console.log('게임이 이미 진행중입니다.');
      sendJoinRoomResponse(server.game, clientKey, false);
      return;
    }

    const user = new User(userId, clientKey, nickname);
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
    joinRoomNotification(server.game, user);
  } catch (e) {
    console.error(e);
    sendJoinRoomResponse(server.game, clientKey, false);
  }
};
