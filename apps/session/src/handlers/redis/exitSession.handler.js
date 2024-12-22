import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const exitSessionHandler = async (serverInstance, data) => {
  const { clientKey } = data;

  try {
    // 만약 해당 유저의 세션이 없다면 return
    if (!serverInstance.userSessions[clientKey]) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }
    delete serverInstance.userSessions[clientKey];
  } catch (e) {
    handleError(e);
  }
};
