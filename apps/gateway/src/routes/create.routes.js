// 라우팅 테이블 생성 함수
export const createRoutingTable = (clientPacket) => {
  const routingTable = {};

  for (const serverName in clientPacket) {
    const packets = clientPacket[serverName];
    for (const packetName in packets) {
      const packetId = packets[packetName];
      routingTable[packetId] = serverName;
    }
  }
  // 생성된 라우팅 테이블 출력
  console.log(routingTable);
  return routingTable;
};
