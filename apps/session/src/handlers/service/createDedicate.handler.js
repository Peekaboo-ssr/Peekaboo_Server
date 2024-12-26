import handleError from '@peekaboo-ssr/error/handleError';

export const createDedicatedHandler = async (server, payload) => {
  console.log('Session >> createDedicate.....');
  try {
    const { hostKey, dedicateKey, distributorKey, gameSessionId, inviteCode } =
      payload;

    // 게임 세션에 등록
    server.gameSessions[gameSessionId].hostKey = hostKey;
    server.gameSessions[gameSessionId].inviteCode = inviteCode;
    server.gameSessions[gameSessionId].dedicateKey = dedicateKey;
    server.gameSessions[gameSessionId].distributorKey = distributorKey;

    // hostKey 유저 게임 세션에 참가하도록 함
    server.userSessions[hostKey].type = 'game';

    console.log('방 생성한 유저 game 세션으로 이동');
    console.log(
      `세션 서비스에 등록된 dedicate: `,
      server.gameSessions[gameSessionId],
    );
  } catch (e) {
    handleError(e);
  }
};
