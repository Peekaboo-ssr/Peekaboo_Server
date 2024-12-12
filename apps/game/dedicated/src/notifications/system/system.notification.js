import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';
import { gameSessions } from '../../sessions/sessions.js';

/**
 * 연결 종료한 유저를 접속 중인 다른 유저들에게 disconnectPlayerNotification로 알려주는 함수
 * @param {*} gameSession
 * @param {*} disconnectUserId
 */
export const disconnectPlayerNotification = async (
  gameSession,
  disconnectUserId,
) => {
  const payload = {
    userId: disconnectUserId,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.DisconnectPlayerNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

export const blockInteractionNotification = (gameSession) => {
  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.BlockInteractionNotification,
      {},
      user.socket.sequence++,
    );

    user.socket.write(packet);
  });
};

export const remainingTimeNotification = (gameSession) => {
  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.RemainingTimeNotification,
      { remainingTime: gameSession.remainingTime },
      user.socket.sequence++,
    );

    user.socket.write(packet);
  });
};

export const stageEndNotification = (gameSession) => {
  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.StageEndNotification,
      { difficultyId: gameSession.difficultyId },
      user.socket.sequence++,
    );

    user.socket.write(packet);
  });
};
