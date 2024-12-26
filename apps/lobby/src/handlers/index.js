import config from '@peekaboo-ssr/config/lobby';
import { enterLobbyHandler } from './client/enterLobby.handler.js';
import { showWaitingRoomHandler } from './client/showWaitingRoom.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';
import { changeNicknameHandler } from './client/changeNickname.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.lobby.EnterLobbyRequest]: {
      handler: enterLobbyHandler,
    },
    [config.clientPacket.lobby.WaitingRoomListRequest]: {
      handler: showWaitingRoomHandler,
    },
    [config.clientPacket.lobby.ChangeNicknameRequest]: {
      handler: changeNicknameHandler,
    },
  },
  service: {
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
  },
};
