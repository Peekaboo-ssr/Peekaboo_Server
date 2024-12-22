import config from '@peekaboo-ssr/config/lobby';
import { enterLobbyHandler } from './client/lobby/enterLobby.handler.js';
import { showWaitingRoomHandler } from './client/lobby/showWaitingRoom.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.lobby.EnterLobbyRequest]: {
      handler: enterLobbyHandler,
    },
    [config.clientPacket.lobby.WaitingRoomListRequest]: {
      handler: showWaitingRoomHandler,
    },
  },
  service: {
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
  },
};
