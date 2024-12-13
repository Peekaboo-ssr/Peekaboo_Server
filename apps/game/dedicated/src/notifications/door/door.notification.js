import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';

export const doorToggleNotification = (game, payload) => {
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.DoorToggleNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
