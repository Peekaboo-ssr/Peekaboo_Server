import config from '@peekaboo-ssr/config/account';
import { loginRequestHandler } from './client/login.handler.js';
import { registAccountHandler } from './client/regist.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.account.RegistAccountRequest]: {
      handler: registAccountHandler,
    },
    [config.clientPacket.account.LoginRequest]: {
      handler: loginRequestHandler,
    },
    [config.clientPacket.account.ChangeNicknameRequest]: {},
  },
  pubsub: {},
  service: {
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
  },
};
