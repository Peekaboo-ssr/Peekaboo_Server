import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';

export const exitSessionHandler = async (serverInstance, data) => {
  try {
    // 만약 해당 유저의 세션이 없다면 return
    if (!serverInstance.userSessions[data.clientKey]) {
      throw new CustomError(errorCodesMap.INVALID_PACKET);
    }
    delete serverInstance.userSessions[data.clientKey];
  } catch (e) {
    handleError(e);
  }
};
