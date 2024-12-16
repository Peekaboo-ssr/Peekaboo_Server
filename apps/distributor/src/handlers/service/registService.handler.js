import { sendInfo } from '../../notifications/connection.notification.js';
import { serviceMap } from '../../source/connection.source.js';

/**
 * 연결된 서비스를 serviceMap에 등록하는 함수입니다.
 */
export const connectServiceHandler = async (socket, payload) => {
  const { host, port } = payload;

  const key = host + ':' + port;

  if (payload.name === 'dedicated') {
    serviceMap.dedicates[key] = {
      socket: socket,
    };
    serviceMap.dedicates[key].info = payload;
  } else {
    serviceMap.microservices[key] = {
      socket: socket,
    };
    serviceMap.microservices[key].info = payload;
  }
  sendInfo();
};
