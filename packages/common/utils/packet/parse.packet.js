// proto 파일들을 불러와서 할 수 있도록 할 예정.
import serviceProtoNames from '@peekaboo-ssr/modules-constants/serviceProtoNames';
import clientProtoNames from '@peekaboo-ssr/modules-constants/clientProtoNames';
import protoMessages from '@peekaboo-ssr/protobufjs/protoMessages';

// 서비스가 보낸 페이로드에 대해 파싱하기 위한 함수
export const parsePacketS2S = (packetType, payloadBuffer) => {
  const packet = protoMessages.common.ServicePacket;

  let payloadData;
  try {
    payloadData = packet.decode(payloadBuffer);
  } catch (e) {
    console.error(e);
  }

  return payloadData[serviceProtoNames[packetType]];
};

// 게임 클라이언트가 보낸 페이로드에 대해 파싱하기 위한 함수
export const parsePacketG2S = (packetType, payloadBuffer) => {
  const packet = protoMessages.common.GamePacket;

  let payloadData;
  try {
    payloadData = packet.decode(payloadBuffer);
  } catch (e) {
    console.error(e);
  }

  return payloadData[clientProtoNames[packetType]];
};
