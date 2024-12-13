import { sendInfo } from '../../notifications/connection.notification.js';
import { serviceMap } from '../../source/connection.source.js';

/**
 * 연결된 서비스를 serviceMap에 등록하는 함수입니다.
 */
export const connectServiceHandler = async (socket, payload) => {
  const { host, port } = payload;
  // let ip = socket.remoteAddress;
  // if (ip.startsWith('::')) {
  //   ip = ip.replace('::ffff:', '');
  // }

  // if (ip === '127.0.0.1') {
  //   ip = ip.replace('127.0.0.1', '0.0.0.0');
  // }

  const key = host + ':' + port;

  // 아 맞네............................................. ㅆ,ㅡㅂㄹ distributor랑 연결된거였네 하
  // console.log('connectService payload: ', payload);

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
