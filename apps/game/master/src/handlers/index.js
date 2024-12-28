import config from '@peekaboo-ssr/config/game';
import { createRoomHandler } from './client/room/createRoom.handler.js';
import { JoinRoomByInviteCodeHandler } from './client/room/joinRoomInviteCode.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';
import { JoinRoomIdHandler } from './client/room/joinRoomId.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.game.CreateRoomRequest]: {
      handler: createRoomHandler,
    },
    [config.clientPacket.game.JoinRoomByInviteCodeRequest]: {
      handler: JoinRoomByInviteCodeHandler,
    },
    [config.clientPacket.game.JoinRoomByGameSessionIdRequest]: {
      handler: JoinRoomIdHandler,
    },
  },
  service: {
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
  },
};
