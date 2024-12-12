import config from '@peekaboo-ssr/config/distributor';
import { connectServiceHandler } from './service/registService.handler.js';

export const handlers = {
  service: {
    [config.servicePacket.ConnectServiceRequest]: {
      handler: connectServiceHandler,
    },
  },
};
