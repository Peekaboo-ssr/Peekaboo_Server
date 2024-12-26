import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';

export const createDedicatedHandler = async (server, payload) => {
  console.log('Session >> createDedicate.....');
  try {
    const { hostKey, dedicateKey, distributorKey, gameSessionId, inviteCode } =
      payload;

    // 게임 세션에 등록
    if (!server.gameSessions.gameSessionId) {
      server.gameSessions[gameSessionId] = {
        dedicateKey,
        distributorKey,
        inviteCode,
        numberOfPlayer: 0,
        latency: 0,
        state: 0,
      };

      // hostKey 유저 게임 세션에 참가하도록 함
      server.userSessions[hostKey].type = 'game';
      console.log('방 생성한 유저 game 세션으로 이동');
      console.log(
        `세션 서비스에 등록된 dedicate: `,
        server.gameSessions[gameSessionId],
      );
    } else {
      // 게임 생성이 마무리가 안되었을 때 발생
      throw new CustomError(errorCodesMap.SOCKET_ERROR);
    }
  } catch (e) {
    handleError(e);
  }
};
