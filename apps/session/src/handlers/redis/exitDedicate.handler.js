import CustomError from '@peekaboo-ssr/error/CustomError';
import handleError from '@peekaboo-ssr/error/handleError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const exitDedicatedHandler = async (server, data) => {
  console.log('Session >> exitDedicate.....');
  const { clientKey, gameSessionId } = data;
  try {
    if (!server.userSessions[clientKey]) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    // 게임 세션에 등록
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
