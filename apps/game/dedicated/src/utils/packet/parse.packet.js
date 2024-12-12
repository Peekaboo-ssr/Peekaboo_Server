import protoMessages from '../../init/load.protos.js';
import { PACKET_MAPS } from '../../constants/packet.js';

// 게임 클라이언트가 보낸 페이로드에 대해 파싱하기 위한 함수
export const parsePacketG2S = (packetType, payloadBuffer) => {
  const packet = protoMessages.common.GamePacket;

  let payloadData;
  try {
    payloadData = packet.decode(payloadBuffer);
  } catch (e) {
    console.error(e);
  }

  return payloadData[PACKET_MAPS.client[packetType]];
};

// 서비스가 보낸 페이로드에 대해 파싱하기 위한 함수
export const parsePacketS2S = (packetType, payloadBuffer) => {
  const packet = protoMessages.common.ServicePacket;

  let payloadData;
  try {
    payloadData = packet.decode(payloadBuffer);
  } catch (e) {
    console.error(e);
  }
  return payloadData[PACKET_MAPS.service[packetType]];
};
