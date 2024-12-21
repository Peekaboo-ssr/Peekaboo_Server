import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';
import { CHARACTER_STATE } from '../../constants/state.js';

/**
 * 유저의 움직임 값을 보내주는 함수
 */
export const usersLocationNotification = (game, requestUser) => {
  const userLocations = game.users.map((user) => {
    if (
      user.state !== CHARACTER_STATE.DIED ||
      user.state !== CHARACTER_STATE.EXIT
    ) {
      const lastPosition = user.character.lastPosition; // 움직이기 전 좌표
      const position = user.character.position; //현 좌표
      const rotation = user.character.rotation;

      if (
        position.x === lastPosition.x &&
        position.y === lastPosition.y &&
        position.z === lastPosition.z
      ) {
        return {
          userId: user.id,
          position: position.getPosition(),
          rotation: rotation.getRotation(),
        };
      }

      const timeDiff = Math.floor(
        (Date.now() -
          user.character.lastUpdateTime +
          requestUser.character.latency) /
          1000,
      );

      const distance = user.character.speed * timeDiff;
      const directionX = position.x - lastPosition.x;
      const directionZ = position.z - lastPosition.z;
      const vectorSize = Math.sqrt(
        Math.pow(directionX, 2) + Math.pow(directionZ, 2),
      );
      if (vectorSize < 1) {
        return {
          userId: user.id,
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

      const locationData = {
        userId: user.id,
        position: predictionPosition,
        rotation: rotation.getRotation(),
      };

      return locationData;
    }
  });

  const payload = {
    playerMoveInfos: userLocations,
  };

  // game.users.forEach((user) => {
  //   const userLocationPayload = createPacketS2G(
  //     config.clientPacket.dedicated.PlayerMoveNotification,
  //     user.clientKey,
  //     payload,
  //   );
  //   game.socket.write(userLocationPayload);
  // });

  const userLocationPayload = createPacketS2G(
    config.clientPacket.dedicated.PlayerMoveNotification,
    requestUser.clientKey,
    payload,
  );

  game.socket.write(userLocationPayload);
};

export const playerStateChangeNotification = (game, payload) => {
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.PlayerStateChangeNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
