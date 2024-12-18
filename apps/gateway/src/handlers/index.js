import config from '@peekaboo-ssr/config/gateway';
import { connectDedicatedHandler } from './service/connectDedicated.handler.js';
import { createDedicatedHandler } from './service/createDedicated.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';

export const handlers = {
  service: {
    [config.servicePacket.ConnectDedicatedRequest]: {
      handler: connectDedicatedHandler,
    },
    [config.servicePacket.CreateDedicatedRequest]: {
      handler: createDedicatedHandler,
    },
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
  },
};
