import { getDedicateKeyByClientKey } from '../sessions/find.session.js';

export const findRoutingClients = (server, packetType, clientKey = null) => {
  const routingServiceName = server.routingTable[packetType];

  switch (routingServiceName) {
    case 'dedicated':
      const gameSessionKey = getDedicateKeyByClientKey(
        server.connectClients,
        clientKey,
      );
      return server.mapClients.dedicates[gameSessionKey].client;
    default:
      for (const [key, value] of Object.entries(
        server.mapClients.microservices,
      )) {
        if (value.info.name === routingServiceName) {
          console.log('찾음!!!');
          return value.client;
        }
      }
  }
};
