import CustomError from '@peekaboo-ssr/error/CustomError';
import handleError from '@peekaboo-ssr/error/handleError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const createDedicatedHandler = async (serverInstance, data) => {
  try {
    const { dedicateKey, distributorKey, gameSessionId } = data;

    if (!serverInstance.gameSessions[gameSessionId]) {
      throw new CustomError(errorCodesMap.GAME_NOT_FOUND);
    }

    // 게임 세션에 등록
    serverInstance.gameSessions[gameSessionId].dedicateKey = dedicateKey;
    serverInstance.gameSessions[gameSessionId].distributorKey = distributorKey;

    console.log(
      `세션 서비스에 등록된 dedicate: `,
      serverInstance.gameSessions[gameSessionId],
    );
  } catch (e) {
    handleError(e);
  }
};
