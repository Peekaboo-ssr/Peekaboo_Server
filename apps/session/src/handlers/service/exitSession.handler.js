import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const exitSessionHandler = async (server, payload) => {
  const { clientKey } = payload;

  try {
    // 만약 해당 유저의 세션이 없다면 return
    if (!server.userSessions[clientKey]) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }
    delete server.userSessions[clientKey];
    console.log('유저가 정상적으로 삭제되었습니다.');
  } catch (e) {
    handleError(e);
  }
};
