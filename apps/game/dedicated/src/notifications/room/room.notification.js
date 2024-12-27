import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';
import { removeUserRedisFromGame } from '../../redis/user.redis.js';

/**
 * 방에 참가한 플레이어 정보를 기존 유저들에게 알리는 함수
 */
export const joinRoomNotification = async (game, newUser) => {
  try {
    const payload = {
      userId: newUser.id,
      nickname: newUser.nickname,
    };

    game.users.forEach((user) => {
      if (user.id !== newUser.id) {
        const packet = createPacketS2G(
          config.clientPacket.dedicated.JoinRoomNotification,
          user.clientKey,
          payload,
        );
        game.socket.write(packet);
      }
    });
  } catch (e) {
    console.error(e);
  }
};

export const startStageNotification = (game, itemInfos, ghostInfos) => {
  try {
    const payload = {
      globalFailCode: 0,
      message: '로딩이 완료되어 게임을 시작합니다.',
      itemInfos,
      ghostInfos,
    };

    game.users.forEach((user) => {
      const packet = createPacketS2G(
        config.clientPacket.dedicated.StartStageNotification,
        user.clientKey,
        payload,
      );
      game.socket.write(packet);
    });
  } catch (e) {
    console.error(e);
  }
};

export const kickRoomNotification = (game) => {
  game.users.forEach(async (user) => {
    if (user.id !== game.hostId) {
      await removeUserRedisFromGame(user.id, game.id);
      const packet = createPacketS2G(
        config.clientPacket.dedicated.KickRoomNotification,
        user.clientKey,
        {},
      );
      game.socket.write(packet);
    }
  });
};

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
    if (user.id !== disconnectUserId) {
      const packet = createPacketS2G(
        config.clientPacket.dedicated.DisconnectPlayerNotification,
        user.clientKey,
        payload,
      );
      game.socket.write(packet);
    }
  });
};
