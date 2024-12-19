import config from '@peekaboo-ssr/config/game';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const lifeResponse = (socket, clientKey, payload) => {
  const packet = createPacketS2G(
    config.clientPacket.dedicated.PlayerLifeResponse,
    clientKey,
    payload,
  );

  socket.write(packet);
};
