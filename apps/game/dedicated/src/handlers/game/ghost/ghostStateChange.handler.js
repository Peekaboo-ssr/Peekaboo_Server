import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { ghostStateChangeNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getGameSessionById } from '../../../sessions/game.session.js';
import { getUserById } from '../../../sessions/user.sessions.js';

// 호스트만 요청
export const ghostStateChangeRequestHandler = ({ socket, payload }) => {
  try {
    const { ghostStateInfo } = payload;
    const { ghostId, characterState } = ghostStateInfo;
    // user 검증
    const user = getUserById(socket.userId);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    // 게임 세션 검증
    const gameSession = getGameSessionById(user.gameId);
    if (!gameSession) {
      throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
    }

    console.log('ghostState--------', characterState);
    ghostStateChangeNotification(gameSession, ghostId, characterState);
  } catch (e) {
    handleError(e);
  }
};
