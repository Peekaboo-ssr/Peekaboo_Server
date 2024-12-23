import { serviceMap } from '../../source/connection.source.js';

// Distributor에서 receiver에 맞는 라우팅을 찾는 함수
export const findServiceByReceiver = (receiver) => {
  // distributor 면 찾지 않고 바로 return;
  if (receiver === 'distributor') {
    return null;
  }

  // ip:port 형식은 : 가 있음. (dedicated 로 판단)
  // : 가 없으면 일반 서비스로 판단
  if (receiver.includes(':')) {
    // return serviceMap.dedicates[receiver].socket;
    for (const [key, value] of Object.entries(serviceMap.dedicates)) {
      if (key === receiver) {
        return value.socket;
      }
    }
  } else {
    for (const [key, value] of Object.entries(serviceMap.microservices)) {
      if (value.info.name == receiver) {
        return value.socket;
      }
    }
  }

  return null;
};
