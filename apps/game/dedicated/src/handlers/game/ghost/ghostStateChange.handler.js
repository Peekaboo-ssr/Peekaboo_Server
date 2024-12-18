import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { ghostStateChangeNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

// 호스트만 요청
export const ghostStateChangeRequestHandler = (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { ghostStateInfo } = payload;
    const { ghostId, characterState } = ghostStateInfo;

    // user 검증
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    console.log('ghostState--------', characterState);
    ghostStateChangeNotification(server.game, ghostId, characterState);
  } catch (e) {
    handleError(e);
  }
};
