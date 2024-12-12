import { createPacketG2S } from '@peekaboo-ssr/utils/createPacket';
import { findRoutingClients } from './find.routes.js';

export const routeG2SHandler = async (
  socket,
  packetType,
  payloadLength,
  payloadBuffer,
  server,
) => {
  try {
    const clientKey = socket.remoteAddress + ':' + socket.remotePort;
    const routingClient = findRoutingClients(server, packetType, clientKey);

    if (!routingClient) {
      console.error('라우팅할 클라이언트 찾지 못함!!!', packetType);
      return;
    }

    // 서비스라면 G2S로
    const routeBuffer = createPacketG2S(
      packetType,
      clientKey,
      payloadLength,
      payloadBuffer,
    );
    routingClient.write(routeBuffer);
  } catch (e) {
    console.error(e);
  }
};
