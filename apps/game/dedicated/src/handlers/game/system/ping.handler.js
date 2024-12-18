import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

// 유저로부터 핑을 받으면 호출되도록 함
export const pingHandler = (socket, clientKey, payload, server) => {
  try {
    console.log('ping........');
    const user = getUserByClientKey(server.game.users, clientKey);
    console.log('핑마다 찾은 유저: ', user);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }
    console.log(user.receivePing);

    user.receivePing(payload);
  } catch (e) {
    handleError(e);
  }
};
