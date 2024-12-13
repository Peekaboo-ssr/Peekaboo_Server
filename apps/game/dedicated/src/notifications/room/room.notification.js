import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';
import { GAME_SESSION_STATE } from '../../constants/state.js';

/**
 * 방에 참가한 플레이어 정보를 기존 유저들에게 알리는 함수
 */
export const joinRoomNotification = async (game, userId) => {
  const payload = {
    userId,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.JoinRoomNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const startStageNotification = (game, itemInfos) => {
  const payload = {
    globalFailCode: 0,
    message: '로딩이 완료되어 게임을 시작합니다.',
    itemInfos,
  };

  console.log(`StartStageNotification payload : ${JSON.stringify(payload)}`);

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.StartStageNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
