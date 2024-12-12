import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';
import { CHARACTER_STATE } from '../../constants/state.js';
import CustomError from '../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';

/**
 * 귀신의 움직임값을 보내주는 함수입니다.
 */
export const ghostsLocationNotification = (gameSession) => {
  // ghosts에 ghost가 없다면 ghostsLocationNotification을 보내지 않는다.
  if (gameSession.ghosts.length === 0) {
    return;
  }

  // 보내줄 데이터 추출하여 정리
  const ghostMoveInfos = gameSession.ghosts.map((ghost) => {
    const ghostMoveInfo = {
      ghostId: ghost.id,
      position: ghost.position.getPosition(),
      // rotation: ghost.rotation.getRotation(),
    };

    return ghostMoveInfo;
  });

  // 해당 게임 세션에 참여한 유저들에게 notification 보내주기
  gameSession.users.forEach((user) => {
    // 호스트 빼고 보내주기
    if (user.id === gameSession.hostId) {
      return;
    }
    const responseData = createPacketS2G(
      PACKET_TYPE.game.GhostMoveNotification,
      { ghostMoveInfos },
      user.socket.sequence++,
    );
    user.socket.write(responseData);
  });
};

/**
 * 고스트의 상태변화 통지를 알리는 함수입니다. (호스트 제외)
 * @param {*} gameSession
 * @param {*} ghostId
 * @param {*} ghostState
 */
export const ghostStateChangeNotification = (
  gameSession,
  ghostId,
  characterState,
) => {
  // 고스트 검증
  const ghost = gameSession.getGhost(ghostId);
  if (!ghost) {
    throw new CustomError(ErrorCodesMaps.GHOST_NOT_FOUND);
  }
  ghost.setState(ghostState);

  const ghostStateInfo = {
    ghostId,
    characterState,
  };

  const payload = {
    ghostStateInfo,
  };

  // 호스트 제외 packet 전송
  gameSession.users.forEach((user) => {
    if (gameSession.hostId === user.id) {
      return;
    }
    const packet = createPacketS2G(
      PACKET_TYPE.game.GhostStateChangeNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

/**
 * 귀신의 특수상태 통지를 알리는 함수입니다. (호스트 제외)
 * @param {*} gameSession
 * @param {*} payload
 */
export const ghostSpecialStateNotification = (gameSession, payload) => {
  const { ghostId, specialState, isOn } = payload;

  // 고스트 검증
  const ghost = gameSession.getGhost(ghostId);
  if (!ghost) {
    throw new CustomError(ErrorCodesMaps.GHOST_NOT_FOUND);
  }

  const data = {
    ghostId,
    specialState,
    isOn,
  };

  // 호스트 제외 packet 전송
  gameSession.users.forEach((user) => {
    if (gameSession.hostId === user.id) {
      return;
    }

    const packet = createPacketS2G(
      PACKET_TYPE.game.GhostSpecialStateNotification,
      data,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

// 귀신 생성 알림
export const ghostSpawnNotification = (gameSession, ghostInfo) => {
  const payload = {
    ghostInfo,
  };
  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.GhostSpawnNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};
