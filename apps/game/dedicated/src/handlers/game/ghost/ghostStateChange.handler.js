import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { ghostStateChangeNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

// 호스트만 요청
export const ghostStateChangeRequestHandler = ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { ghostStateInfo } = payload;
    const { ghostId, characterState } = ghostStateInfo;

    // user 검증
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    console.log('ghostState--------', characterState);
    ghostStateChangeNotification(server.game, ghostId, characterState);
  } catch (e) {
    handleError(e);
  }
};
