import { createDedicatedHandler } from './redis/createDedicate.handler.js';
import { exitSessionHandler } from './redis/exitSession.handler.js';
import {
  FindDedicateByInviteCodeHandler,
  FindDedicateByIdHandler,
} from './redis/findGame.handler.js';
import { findUserHandler } from './redis/findUser.handler.js';
import { joinSessionHandler } from './redis/joinSession.handler.js';
import config from '@peekaboo-ssr/config/session';

export const handlers = {
  client: {},
  service: {},
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
    [config.pubAction.CreateDedicateRequest]: {
      handler: createDedicatedHandler,
    },
    [config.pubAction.FindDedicateByInviteCodeRequest]: {
      handler: FindDedicateByInviteCodeHandler,
    },
    [config.pubAction.FindDedicateByIdRequest]: {
      handler: FindDedicateByIdHandler,
    },
  },
};
