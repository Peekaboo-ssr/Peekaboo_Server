import config from '@peekaboo-ssr/config/lobby';
import { enterLobbyHandler } from './lobby/enterLobby.handler.js';
import { refreshLobbyHandler } from './lobby/refreshLobby.handler.js';
import { searchLobbyHandler } from './lobby/searchLobby.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.lobby.EnterLobbyRequest]: {
      handler: enterLobbyHandler,
    },
    [config.clientPacket.lobby.RefreshLobbyRequest]: {
      handler: refreshLobbyHandler,
    },
    [config.clientPacket.lobby.SearchRoomRequest]: {
      handler: searchLobbyHandler,
    },
  },
};
