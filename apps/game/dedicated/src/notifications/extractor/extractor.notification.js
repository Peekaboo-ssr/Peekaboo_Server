import { PACKET_TYPE } from '../../constants/packet.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

export const extractSoulNotification = (gameSession, soulAccumulatedAmount) => {
  // 해당 게임 세션에 참여한 유저들에게 notification 보내주기
  gameSession.users.forEach((user) => {
    const responseData = createPacketS2G(
      PACKET_TYPE.game.ExtractSoulNotification,
      { soulAccumulatedAmount },
      user.socket.sequence++,
    );
    user.socket.write(responseData);
  });
};
