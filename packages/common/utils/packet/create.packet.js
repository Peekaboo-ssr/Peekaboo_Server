import clientHeader from '@peekaboo-ssr/modules-constants/clientHeader';
import serviceHeader from '@peekaboo-ssr/modules-constants/serviceHeader';
import serviceProtoNames from '@peekaboo-ssr/modules-constants/serviceProtoNames';
import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import clientProtoNames from '@peekaboo-ssr/modules-constants/clientProtoNames';
import protoMessages from '@peekaboo-ssr/protobufjs/protoMessages';
import config from '@peekaboo-ssr/config/shared';

// Distributor => 서비스 / 서비스 => Distributor 패킷을 생성하는 함수
// MSA 서비스 간 패킷을 생성하는 함수로 통일
export const createPacketS2S = (
  packetType,
  sender,
  receiver,
  payloadData = {},
) => {
  // 1. packetType 작성
  const packetTypeBuffer = Buffer.alloc(serviceHeader.typeLength);
  packetTypeBuffer.writeUInt16BE(packetType);

  // 2. 보내는 서비스 길이 1 byte
  const senderLengthBuffer = Buffer.alloc(serviceHeader.senderLength);
  senderLengthBuffer.writeUInt8(sender.length);

  // 3. 보내는 서비스 bytes
  const senderBuffer = Buffer.from(sender, 'utf-8');

  // 4. 받는 서비스 길이 1 byte
  const receiverLengthBuffer = Buffer.alloc(serviceHeader.receiverLength);
  receiverLengthBuffer.writeUint8(receiver.length);

  // 5. 받는 서비스 bytes
  const receiverBuffer = Buffer.from(receiver, 'utf-8');

  // 7. 페이로드 bytes
  const packet = protoMessages.common.ServicePacket;
  const oneOfPayloadData = {};
  oneOfPayloadData[serviceProtoNames[packetType]] = payloadData;
  let payloadBuffer;
  try {
    payloadBuffer = packet.encode(oneOfPayloadData).finish();
  } catch (e) {
    console.error(e);
  }

  // 6. 페이로드 길이 4 byte
  const payloadLengthBuffer = Buffer.alloc(serviceHeader.payloadLength);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  return Buffer.concat([
    packetTypeBuffer,
    senderLengthBuffer,
    senderBuffer,
    receiverLengthBuffer,
    receiverBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};

// 게이트에서 서비스를 위한 패킷을 만드는 함수
export const createPacketG2S = (
  packetType,
  clientKey,
  payloadLength,
  payloadBuffer,
) => {
  const packetTypeBuffer = Buffer.alloc(clientHeader.typeLength);
  packetTypeBuffer.writeUInt16BE(packetType);

  const clientKeyLengthBuffer = Buffer.alloc(clientHeader.clientKeyLength);
  clientKeyLengthBuffer.writeUInt8(clientKey.length);

  const clientKeyBuffer = Buffer.from(clientKey, 'utf-8');

  const payloadLengthBuffer = Buffer.alloc(clientHeader.payloadLength);
  payloadLengthBuffer.writeUInt32BE(payloadLength);

  return Buffer.concat([
    packetTypeBuffer,
    clientKeyLengthBuffer,
    clientKeyBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};

// 서비스에서 게이트를 위한 패킷을 만드는 함수
export const createPacketS2G = (packetType, clientKey, payloadData = {}) => {
  const packetTypeBuffer = Buffer.alloc(clientHeader.typeLength);
  packetTypeBuffer.writeUInt16BE(packetType);

  const clientKeyLengthBuffer = Buffer.alloc(clientHeader.clientKeyLength);
  clientKeyLengthBuffer.writeUInt8(clientKey.length);

  const clientKeyBuffer = Buffer.from(clientKey);

  const payloadLengthBuffer = Buffer.alloc(clientHeader.payloadLength);

  const packet = protoMessages.common.GamePacket;

  const oneOfPayloadData = {};
  oneOfPayloadData[clientProtoNames[packetType]] = payloadData;

  let payloadBuffer;
  try {
    payloadBuffer = packet.encode(oneOfPayloadData).finish();
  } catch (e) {
    console.error(e);
  }

  // Send Logging Test
  // PingRequest, PlayerMoveNotification, GhostMoveNotification는 제외
  // if (
  //   packetType !== clientPacket.dedicated.PlayerMoveNotification &&
  //   packetType !== clientPacket.dedicated.GhostMoveNotification &&
  //   packetType !== clientPacket.dedicated.PingRequest &&
  //   packetType !== clientPacket.dedicated.PlayerStateChangeNotification
  // ) {
  //   console.log(
  //     `#@!SEND!@# PacketType : ${
  //       clientProtoNames[packetType]
  //     } => Payload ${JSON.stringify(oneOfPayloadData)}`,
  //   );
  // }
  if (packetType === clientPacket.dedicated.PlayerMoveNotification) {
    console.log(
      `#@!SEND!@# PacketType : ${
        clientProtoNames[packetType]
      } => Payload ${JSON.stringify(oneOfPayloadData)}`,
    );
  }

  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  return Buffer.concat([
    packetTypeBuffer,
    clientKeyLengthBuffer,
    clientKeyBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};

// 게이트에서 Client를 위한 패킷을 만드는 함수
export const createPacketG2C = (packetType, payloadBuffer, sequence) => {
  const typeBuffer = Buffer.alloc(clientHeader.typeLength);
  typeBuffer.writeUInt16BE(packetType);

  const versionLengthBuffer = Buffer.alloc(clientHeader.versionLength);

  const versionString = config.version;
  versionLengthBuffer.writeUint8(versionString.length);
  const versionBuffer = Buffer.from(versionString, 'utf-8');

  const sequenceBuffer = Buffer.alloc(clientHeader.sequenceLength);
  sequenceBuffer.writeUInt32BE(sequence++);

  const payloadLengthBuffer = Buffer.alloc(clientHeader.payloadLength);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  return Buffer.concat([
    typeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};
