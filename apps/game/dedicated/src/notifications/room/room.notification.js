import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';

/**
 * 방에 참가한 플레이어 정보를 기존 유저들에게 알리는 함수
 */
export const joinRoomNotification = async (game, userId) => {
  try {
    const payload = {
      userId,
    };

    game.users.forEach((user) => {
      if (user.id !== userId) {
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

    console.log(`StartStageNotification payload : ${JSON.stringify(payload)}`);

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
