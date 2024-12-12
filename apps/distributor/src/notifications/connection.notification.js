import { serviceMap } from '../source/connection.source.js';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/distributor';

export const sendInfo = async (socket = null) => {
  // 여기서 서비스를 위한 패킷과 Gateway, Distributor를 위한 패킷을 나누어야 할듯.

  const totalInfoPacket = {
    microservices: [],
    dedicates: [],
    message: '',
  };

  const pushServices = Object.values(serviceMap.microservices).map(
    (service) => {
      totalInfoPacket.microservices.push(service.info);
    },
  );

  const pushDedicates = Object.values(serviceMap.dedicates).map((dedicated) => {
    totalInfoPacket.dedicates.push(dedicated.info);
  });

  await Promise.all([...pushServices, ...pushDedicates]);

  // 소켓이 있는 경우 자신에게 정보를 보냄
  if (socket && socket !== null) {
    totalInfoPacket.message = '기존 서비스 알림';
    const payload = createPacketS2S(
      config.servicePacket.ConnectedServiceNotification,
      'distributor',
      'self',
      totalInfoPacket,
    );
    socket.write(payload);
  } else {
    // 아니라면 마이크로서비스에게 자신의 정보를 보냄
    for (let j in serviceMap.microservices) {
      totalInfoPacket.message = '서비스 변동 알림';
      const payload = createPacketS2S(
        config.servicePacket.ConnectedServiceNotification,
        'distributor',
        serviceMap.microservices[j].info.name,
        totalInfoPacket,
      );
      serviceMap.microservices[j].socket.write(payload);
    }
  }
};
