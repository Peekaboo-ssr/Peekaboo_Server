import { createDedicatedHandler } from './service/createDedicate.handler.js';
import { exitSessionHandler } from './redis/exitSession.handler.js';
import {
  FindDedicateByInviteCodeHandler,
  FindDedicateByIdHandler,
} from './redis/findGame.handler.js';
import { findUserHandler } from './redis/findUser.handler.js';
import { joinSessionHandler } from './redis/joinSession.handler.js';
import config from '@peekaboo-ssr/config/session';
import { waitingRoomResponse } from './redis/waitingRoom.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';
import { updateRoomInfoHandler } from './service/updateRoomInfo.handler.js';
import { exitDedicatedHandler } from './redis/exitDedicate.handler.js';

export const handlers = {
  client: {},
  pubsub: {
    [config.pubAction.FindUserRequest]: {
      handler: findUserHandler,
    },
    [config.pubAction.JoinSessionRequest]: {
      handler: joinSessionHandler,
    },
    [config.pubAction.ExitSessionRequest]: {
      handler: exitSessionHandler,
    },
    [config.pubAction.FindDedicateByInviteCodeRequest]: {
      handler: FindDedicateByInviteCodeHandler,
    },
    [config.pubAction.FindDedicateByIdRequest]: {
      handler: FindDedicateByIdHandler,
    },
    [config.pubAction.WaitingRoomInfosRequest]: {
      handler: waitingRoomResponse,
    },
    [config.pubAction.ExitDedicateRequest]: {
      handler: exitDedicatedHandler,
    },
  },
  service: {
    [config.servicePacket.CreateDedicatedRequest]: {
      handler: createDedicatedHandler,
    },
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
    [config.servicePacket.UpdateRoomInfoRequest]: {
      handler: updateRoomInfoHandler,
    },
  },
};
