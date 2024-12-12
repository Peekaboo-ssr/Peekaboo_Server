import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { getGameSessionById } from '../../../sessions/game.session.js';
import { getUserById } from '../../../sessions/user.sessions.js';
import Ghost from '../../../classes/models/ghost.class.js';
import { ghostSpawnNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getRandomInt } from '../../../utils/math/getRandomInt.js';

/**
 * 귀신의 특수 상태 요청에 대한 핸들러 함수입니다. (호스트만 요청)
 */
export const ghostSpawnHandler = ({ socket, payload }) => {
  try {
    const { ghostTypeId } = payload;

    const user = getUserById(socket.userId);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    const gameSession = getGameSessionById(user.gameId);
    if (!gameSession) {
      throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
    }

    const positionIndex = getRandomInt(
      0,
      gameSession.ghostSpawnPositions.length,
    );
    const ghostPosition = gameSession.ghostSpawnPositions.splice(
      positionIndex,
      1,
    );
    const positions = ghostPosition[0].GhostSpawnPos.split(',').map(
      (position) => {
        return Number(position);
      },
    );
    const rotation = { x: 0, y: 0, z: 0 };
    const position = {
      x: positions[0],
      y: positions[1],
      z: positions[2],
    };

    const ghost = new Ghost(
      gameSession.ghostIdCount++,
      ghostTypeId,
      position,
      //rotation
    );
    gameSession.addGhost(ghost);

    const moveInfo = {
      position,
      rotation,
    };

    const ghostInfo = {
      ghostId: ghost.id,
      ghostTypeId,
      moveInfo,
    };

    ghostSpawnNotification(gameSession, ghostInfo);
  } catch (e) {
    handleError(e);
  }
};
