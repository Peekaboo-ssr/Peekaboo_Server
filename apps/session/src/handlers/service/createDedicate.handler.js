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

    console.log(
      `세션 서비스에 등록된 dedicate: `,
      server.gameSessions[gameSessionId],
    );
  } catch (e) {
    handleError(e);
  }
};
