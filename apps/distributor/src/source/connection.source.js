// Distributor에 연결된 서비스를 담는 맵 객체
// key : socket.remoteAddress + ':' + socket.remotePort
// value : socket (연결된 마이크로서비스 소켓), info
export const serviceMap = {
  microservices: {},
  dedicates: {},
};
