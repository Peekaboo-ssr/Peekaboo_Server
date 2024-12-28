import CustomError from '@peekaboo-ssr/error/CustomError';
import { getUserByClientKey } from '../../sessions/user.sessions.js';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';

export const findUserHandler = (server, data) => {
  const { responseChannel, clientKey, type } = data;
  console.log('findUser..........');
  console.log('findUser channel: ', responseChannel);
  let resMessage = {
    isSuccess: false,
  };
  try {
    const user = getUserByClientKey(server.userSessions, clientKey);

    // 유저가 없거나 유저가 현재 type의 세션이 아닌 경우는 USER_NOT_FOUND 보내주도록 함.
    if (!user || user.type !== type) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    resMessage.isSuccess = true;
    server.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
  } catch (e) {
    server.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
    handleError(e);
  }
};
