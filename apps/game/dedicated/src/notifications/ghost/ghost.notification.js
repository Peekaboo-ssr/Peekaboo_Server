import config from '@peekaboo-ssr/config/game';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

/**
 * 귀신의 움직임값을 보내주는 함수입니다.
 */
export const ghostsLocationNotification = (game) => {
  // ghosts에 ghost가 없다면 ghostsLocationNotification을 보내지 않는다.
  if (game.ghosts.length === 0) {
    return;
  }

  // 보내줄 데이터 추출하여 정리
  // const ghostMoveInfos = game.ghosts.map((ghost) => {
  //   const ghostMoveInfo = {
  //     ghostId: ghost.id,
  //     position: ghost.position.getPosition(),
  //     rotation: ghost.rotation.getRotation(),
  //   };

  //   return ghostMoveInfo;
  // });

  const avgLatency = game.getAvgLatency();

  const ghostMoveInfos = game.ghosts.map((ghost) => {
    if (ghost.state !== _STATE.DIED || ghost.state !== _STATE.EXIT) {
      const lastPosition = ghost.lastPosition; // 움직이기 전 좌표
      const position = ghost.position; //현 좌표
      const rotation = ghost.rotation;

      if (
        position.x === lastPosition.x &&
        position.y === lastPosition.y &&
        position.z === lastPosition.z
      ) {
        return {
          ghostId: ghost.id,
          position: position.getPosition(),
          rotation: rotation.getRotation(),
        };
      }

      // 레이턴시를 어떻게 하지
      const timeDiff = Math.floor(
        (Date.now() - ghost.lastUpdateTime + avgLatency) / 1000,
      );

      const distance = ghost.speed * timeDiff;
      const directionX = position.x - lastPosition.x;
      const directionZ = position.z - lastPosition.z;
      const vectorSize = Math.sqrt(
        Math.pow(directionX, 2) + Math.pow(directionZ, 2),
      );
      if (vectorSize < 1) {
        return {
          ghostId: ghost.id,
          position: position.getPosition(),
          rotation: rotation.getRotation(),
        };
      }

      const unitVectorX = directionX / vectorSize;
      const unitVectorZ = directionZ / vectorSize;

      // 데드레커닝으로 구한 미래의 좌표
      const predictionPosition = {
        x: position.x + unitVectorX * distance,
        y: position.y,
        z: position.z + unitVectorZ * distance,
      };

      const ghostMoveInfo = {
        ghostId: ghost.id,
        position: predictionPosition,
        rotation: rotation.getRotation(),
      };

      return ghostMoveInfo;
    }
  });

  const payload = {
    ghostMoveInfos,
  };
  console.log('@@@@ ghost positions: ', payload);

  // 호스트를 제외한 유저들에게 notification 보내주기
  game.users.forEach((user) => {
    if (user.id === game.hostId) {
      return;
    }
    const packet = createPacketS2G(
      config.clientPacket.dedicated.GhostMoveNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

/**
 * 고스트의 상태변화 통지를 알리는 함수입니다. (호스트 제외)
 * @param {*} server
 * @param {*} ghostId
 * @param {*} characterState
 */
export const ghostStateChangeNotification = (game, ghostId, characterState) => {
  // 고스트 검증
  const ghost = game.getGhost(ghostId);
  if (!ghost) {
    throw new CustomError(errorCodesMap.GHOST_NOT_FOUND);
  }
  ghost.setState(characterState);

  const ghostStateInfo = {
    ghostId,
    characterState,
  };

  const payload = {
    ghostStateInfo,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.GhostStateChangeNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

/**
 * 귀신의 특수상태 통지를 알리는 함수입니다. (호스트 제외)
 * @param {*} game
 * @param {*} payload
 */
export const ghostSpecialStateNotification = (game, payload) => {
  const { ghostId, specialState, isOn } = payload;

  // 고스트 검증
  const ghost = game.getGhost(ghostId);
  if (!ghost) {
    throw new CustomError(errorCodesMap.GHOST_NOT_FOUND);
  }

  const data = {
    ghostId,
    specialState,
    isOn,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.GhostSpecialStateNotification,
      user.clientKey,
      data,
    );
    game.socket.write(packet);
  });
};

// 귀신 생성 알림
export const ghostSpawnNotification = (game, ghostInfo) => {
  const payload = {
    ghostInfo,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.GhostSpawnNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

// 귀신 삭제 알림
export const ghostDeleteNotification = (game, ghostIds) => {
  const payload = {
    ghostIds,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.GhostDeleteNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
