import { PACKET_TYPE } from '../../constants/packet.js';
import CustomError from '../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

/**
 * 귀신의 움직임값을 보내주는 함수입니다.
 */
export const ghostsLocationNotification = (game) => {
  // ghosts에 ghost가 없다면 ghostsLocationNotification을 보내지 않는다.
  if (game.ghosts.length === 0) {
    return;
  }

  // 보내줄 데이터 추출하여 정리
  const ghostMoveInfos = game.ghosts.map((ghost) => {
    const ghostMoveInfo = {
      ghostId: ghost.id,
      position: ghost.position.getPosition(),
      // rotation: ghost.rotation.getRotation(),
    };

    return ghostMoveInfo;
  });

  const payload = {
    ghostMoveInfos,
  };

  // 해당 게임 세션에 참여한 유저들에게 notification 보내주기
  game.users.forEach((user) => {
    if (user.id === game.hostId) {
      return;
    }
    const packet = createPacketS2G(
      PACKET_TYPE.game.GhostMoveNotification,
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
    throw new CustomError(ErrorCodesMaps.GHOST_NOT_FOUND);
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
      PACKET_TYPE.game.GhostStateChangeNotification,
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
    throw new CustomError(ErrorCodesMaps.GHOST_NOT_FOUND);
  }

  const data = {
    ghostId,
    specialState,
    isOn,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.GhostSpecialStateNotification,
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
      PACKET_TYPE.game.GhostSpawnNotification,
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
      PACKET_TYPE.game.GhostDeleteNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
