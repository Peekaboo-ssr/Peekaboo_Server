import { PACKET_TYPE } from '../../constants/packet.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

export const extractSoulNotification = (game) => {
  const payload = {
    soulAccumulatedAmount: game.soulAccumulatedAmount,
  };

  // 해당 게임 세션에 참여한 유저들에게 notification 보내주기
  game.users.forEach((user) => {
    const responseData = createPacketS2G(
      PACKET_TYPE.game.ExtractSoulNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(responseData);
  });
};
