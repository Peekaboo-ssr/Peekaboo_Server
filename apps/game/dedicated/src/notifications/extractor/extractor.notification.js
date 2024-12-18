import config from '@peekaboo-ssr/config/game';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const extractSoulNotification = (game) => {
  const payload = {
    soulCredit: game.soulCredit,
  };

  // 해당 게임 세션에 참여한 유저들에게 notification 보내주기
  game.users.forEach((user) => {
    const responseData = createPacketS2G(
      config.clientPacket.dedicated.ExtractSoulNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(responseData);
  });
};
