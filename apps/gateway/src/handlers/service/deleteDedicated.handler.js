import config from '@peekaboo-ssr/config/gateway';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';

export const deleteDedicatedHandler = (server, payload) => {
  const { dedicateKey } = payload;
  try {
    for (const [key, value] of Object.entries(server.mapClients.dedicates)) {
      if (key === dedicateKey) {
        const users = server.mapClients.dedicates[key].users;
        for (let i in users) {
          server.connectClients[users[i]].dedicateKey = null;
        }
        delete server.mapClients.dedicates[key];

        const s2sPayload = {
          dedicateKey: key,
        };
        const packet = createPacketS2S(
          config.servicePacket.DeleteDedicatedRequest,
          'gateway',
          'session',
          s2sPayload,
        );
        server.clientToDistributor.write(packet);
        return;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
