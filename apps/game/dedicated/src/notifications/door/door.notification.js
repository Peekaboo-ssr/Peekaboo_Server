import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';

export const doorToggleNotification = (gameSession, payload) => {
  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.DoorToggleNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};
