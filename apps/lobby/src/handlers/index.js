import config from '@peekaboo-ssr/config/lobby';
import { enterLobbyHandler } from './lobby/enterLobby.handler.js';
import { showWaitingRoomHandler } from './lobby/showWaitingRoom.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.lobby.EnterLobbyRequest]: {
      handler: enterLobbyHandler,
    },
    [config.clientPacket.lobby.WaitingRoomListRequest]: {
      handler: showWaitingRoomHandler,
    },
  },
};
