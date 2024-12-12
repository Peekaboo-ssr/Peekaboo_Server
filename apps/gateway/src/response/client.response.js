import { createPacketG2C } from '@peekaboo-ssr/utils/createPacket';

// 클라이언트에 패킷을 보내주는 함수
export const sendPacketToClient = (packetType, client, payloadBuffer) => {
  const packet = createPacketG2C(packetType, payloadBuffer, client.sequence);

  client.write(packet);
};
