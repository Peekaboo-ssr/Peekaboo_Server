import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';
import { CHARACTER_STATE } from '../../constants/state.js';

export const blockInteractionNotification = (game) => {
  const payload = {};

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.BlockInteractionNotification,
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
      config.clientPacket.dedicated.RemainingTimeNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};

export const stageEndNotification = async (game, penaltyCredit) => {
  const startPosition = {
    x: -13.17,
    y: 1,
    z: 22.5,
  };

  const [aliveCount, diedCount] = game.users.reduce(
    ([alive, died], user) => {
      if (user.character.life <= 0) {
        return [alive, died + 1];
      }
      return [alive + 1, died];
    },
    [0, 0],
  );

  const payload = {
    remainingDay: game.day,
    startPosition,
    soulCredit: game.soulCredit,
    penaltyCredit,
    aliveCount,
    diedCount,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.StageEndNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const submissionEndNotification = (game, result) => {
  const payload = {
    result,
    day: game.submissionDay,
    submissionValue: game.goalSoulCredit,
  };
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.SubmissionEndNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};

export const selectDifficultyNotification = (game, difficultyId) => {
  const payload = {
    difficultyId,
  };
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.DifficultySelectNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};
