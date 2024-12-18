import { getDedicateKeyByClientKey } from '../sessions/find.session.js';

export const findRoutingClients = (server, packetType, clientKey = null) => {
  const routingServiceName = server.routingTable[packetType];

  switch (routingServiceName) {
    case 'dedicated':
      const dedicateKey = getDedicateKeyByClientKey(
        server.connectClients,
        clientKey,
      );
      return server.mapClients.dedicates[dedicateKey].client;
    default:
      for (const [key, value] of Object.entries(
        server.mapClients.microservices,
      )) {
        if (value.info.name === routingServiceName) {
          return value.client;
        }
      }
  }
};
