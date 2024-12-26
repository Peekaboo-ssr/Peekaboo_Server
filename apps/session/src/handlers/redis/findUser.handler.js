import CustomError from '@peekaboo-ssr/error/CustomError';
import { getUserByClientKey } from '../../sessions/user.sessions.js';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const findUserHandler = (server, data) => {
  try {
    const { responseChannel, clientKey, type } = data;
    console.log('findUser..........');
    let resMessage = {
      isSuccess: false,
    };

    const user = getUserByClientKey(server.userSessions, clientKey);

    // 유저가 없거나 유저가 현재 로비 세션이 아닌 경우는 USER_NOT_FOUND 보내주도록 함.
    if (!user || user.type !== type) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    resMessage.isSuccess = true;
    server.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );

    console.log(`Published response to ${responseChannel}:`, response);
  } catch (e) {
    console.error(e);
  }
};
