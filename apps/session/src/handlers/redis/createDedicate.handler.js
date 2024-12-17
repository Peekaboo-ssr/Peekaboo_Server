export const createDedicatedHandler = async (serverInstance, data) => {
  try {
    const { dedicateKey, distributorKey, gameSessionId, inviteCode } = data;
    // 게임 세션에 등록

    serverInstance.gameSessions[gameSessionId] = {
      dedicateKey,
      distributorKey,
      inviteCode,
    };

    console.log(
      `세션 서비스에 등록된 dedicate: `,
      serverInstance.gameSessions[gameSessionId],
    );
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};
