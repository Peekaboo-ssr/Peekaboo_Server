import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';

/**
 * 유저의 움직임 값을 보내주는 함수
 */
export const usersLocationNotification = (game) => {
  const userLocations = game.users.map((user) => {
    // console.log(game);

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
      (Date.now() - user.character.lastUpdateTime + game.getAvgLatency()) /
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
  });

  game.users.forEach((user) => {
    const userLocationPayload = createPacketS2G(
      PACKET_TYPE.game.PlayerMoveNotification,
      user.clientKey,
      { playerMoveInfos: userLocations },
    );
    game.socket.write(userLocationPayload);
  });
};

export const playerStateChangeNotification = (game, payload) => {
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.PlayerStateChangeNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};
