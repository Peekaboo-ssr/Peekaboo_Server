import User from '../../classes/models/user.class.js';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';
import { sendJoinRoomResponse } from '../../response/room/room.response.js';
import { joinRoomNotification } from '../../notifications/room/room.notification.js';
import { SUBMISSION_DURATION } from '../../constants/game.js';
import { MAX_PLAYER } from '../../constants/game.js';
import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const joinDedicatedHandler = (server, payload) => {
  console.log('joinDedicated.....');
  const { clientKey, userId, nickname } = payload;

  try {
    // 4인 초과라면 실패
    if (server.game.users.length >= MAX_PLAYER) {
      throw new CustomError(
        errorCodesMap.GAME_IS_FULLED,
        config.clientPacket.dedicated.JoinRoomResponse,
        clientKey,
        server.game.socket,
      );
    }

    // 게임 준비 단계 / 서브미션이 첫번째에 첫 날인지 검증
    if (
      server.game.state !== config.clientState.gameState.PREPARE &&
      server.game.day !== SUBMISSION_DURATION &&
      server.game.submissionId !== server.game.gameAssets.submission.data[0].Id
    ) {
      throw new CustomError(
        errorCodesMap.GAME_IS_STARTED,
        config.clientPacket.dedicated.JoinRoomResponse,
        clientKey,
        server.game.socket,
      );
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
    sendJoinRoomResponse(server.game, clientKey);
    joinRoomNotification(server.game, user);
  } catch (e) {
    handleError(e);
  }
};
