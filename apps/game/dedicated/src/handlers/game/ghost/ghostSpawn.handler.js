import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import Ghost from '../../../classes/models/ghost.class.js';
import { ghostSpawnNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getRandomInt } from '../../../utils/math/getRandomInt.js';

/**
 * 귀신 생성 요청에 따른 핸들러 함수입니다.
 */
export const ghostSpawnHandler = ({ socket, clientKey, payload, server }) => {
  try {
    const { ghostTypeId } = payload;

    const user = getUserByClientKey(clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    const positionIndex = getRandomInt(
      0,
      server.game.ghostSpawnPositions.length,
    );
    const ghostPosition = server.game.ghostSpawnPositions.splice(
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
      server.game.ghostIdCount++,
      ghostTypeId,
      position,
      //rotation
    );
    server.game.addGhost(ghost);

    const moveInfo = {
      position,
      rotation,
    };

    const ghostInfo = {
      ghostId: ghost.id,
      ghostTypeId,
      moveInfo,
    };

    ghostSpawnNotification(server.game, ghostInfo);
  } catch (e) {
    handleError(e);
  }
};
