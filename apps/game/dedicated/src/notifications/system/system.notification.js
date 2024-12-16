import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';

/**
 * 연결 종료한 유저를 접속 중인 다른 유저들에게 disconnectPlayerNotification로 알려주는 함수
 * @param {*} game
 * @param {*} disconnectUserId
 */
export const disconnectPlayerNotification = async (game, disconnectUserId) => {
  const payload = {
    userId: disconnectUserId,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.DisconnectPlayerNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const blockInteractionNotification = (game) => {
  const payload = {};

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.BlockInteractionNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};

export const remainingTimeNotification = (game) => {
  const payload = {
    remainingTime: game.remainingTime,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.RemainingTimeNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};

export const stageEndNotification = (game) => {
  const startPosition = {
    x: -13.17,
    y: 1,
    z: 22.5,
  };

  const payload = {
    remainingDay: game.day,
    startPosition,
    isRemainingOver: game.isRemainingOver,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.StageEndNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const submissionEndNotification = (game, result) => {
  const payload = {
    result,
    submissionId: result ? game.submissionId : 0,
  };
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.SubmissionEndNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};
