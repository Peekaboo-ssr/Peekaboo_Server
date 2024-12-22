import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';

export const doorToggleNotification = (game, payload) => {
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.DoorToggleNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
