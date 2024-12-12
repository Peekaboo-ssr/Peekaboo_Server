import { gameSessions } from '../../sessions/game.session.js';

export const createDedicatedHandler = async (serverInstance, data) => {
  try {
    const { dedicateKey, distributorKey, gameSessionId, inviteCode } = data;
    // 게임 세션에 등록

    gameSessions[gameSessionId] = {
      dedicateKey,
      distributorKey,
      inviteCode,
    };

    console.log(`세션 서비스에 등록된 dedicate: `, gameSessions[gameSessionId]);
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};
