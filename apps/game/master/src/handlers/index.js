import config from '@peekaboo-ssr/config/game';
import { createRoomHandler } from './room/createRoom.handler.js';
import { joinRoomHandler } from './room/joinRoom.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.game.CreateRoomRequest]: {
      handler: createRoomHandler,
    },
    [config.clientPacket.game.JoinRoomRequest]: {
      handler: joinRoomHandler,
    },
  },
};
