import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import { connectedServiceNotificationHandler } from './connection/connectService.handler.js';
import { createDedicatedHandler } from './dedicated/createDedicated.handler.js';
import { connectDedicatedHandler } from './dedicated/connectDedicated.handler.js';

export const handlers = {
  [servicePacket.ConnectedServiceNotification]: {
    handler: connectedServiceNotificationHandler,
  },
  [servicePacket.CreateDedicatedRequest]: {
    handler: createDedicatedHandler,
  },
  [servicePacket.ConnectDedicateRequest]: {
    handler: connectDedicatedHandler,
  },
};

export const getHandlerByPacketType = (packetType) => {
  if (!handlers[packetType].handler) {
    console.error('***해당 핸들러를 찾을 수 없습니다***');
    return null;
  }
  return handlers[packetType].handler;
};
