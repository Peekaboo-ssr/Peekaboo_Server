import { config } from '../../config/config.js';
import { PACKET_MAPS } from '../../constants/packet.js';
import protoMessages from '../../init/load.protos.js';

export const createPacketS2G = (packetType, clientKey, payloadData = {}) => {
  const packetTypeBuffer = Buffer.alloc(config.header.client.typeLength);
  packetTypeBuffer.writeUInt16BE(packetType);

  const clientKeyLengthBuffer = Buffer.alloc(
    config.header.client.clientKeyLength,
  );
  clientKeyLengthBuffer.writeUInt8(clientKey.length);

  const clientKeyBuffer = Buffer.from(clientKey);

  const payloadLengthBuffer = Buffer.alloc(config.header.client.payloadLength);

  const packet = protoMessages.common.GamePacket;

  const oneOfPayloadData = {};
  oneOfPayloadData[PACKET_MAPS.client[packetType]] = payloadData;

  let payloadBuffer;
  try {
    payloadBuffer = packet.encode(oneOfPayloadData).finish();
  } catch (e) {
    console.error(e);
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

export const createPacketS2S = (
  packetType,
  sender,
  receiver,
  payloadData = {},
) => {
  // 1. packetType 작성
  const packetTypeBuffer = Buffer.alloc(config.header.service.typeLength);
  packetTypeBuffer.writeUInt16BE(packetType);

  // 2. 보내는 서비스 길이 1 byte
  const senderLengthBuffer = Buffer.alloc(config.header.service.senderLength);
  senderLengthBuffer.writeUInt8(sender.length);

  // 3. 보내는 서비스 bytes
  const senderBuffer = Buffer.from(sender, 'utf-8');

  // 4. 받는 서비스 길이 1 byte
  const receiverLengthBuffer = Buffer.alloc(
    config.header.service.receiverLength,
  );
  receiverLengthBuffer.writeUint8(receiver.length);

  // 5. 받는 서비스 bytes
  const receiverBuffer = Buffer.from(receiver, 'utf-8');

  // 7. 페이로드 bytes
  const packet = protoMessages.common.ServicePacket;
  const oneOfPayloadData = {};
  oneOfPayloadData[PACKET_MAPS.service[packetType]] = payloadData;
  let payloadBuffer;
  try {
    payloadBuffer = packet.encode(oneOfPayloadData).finish();
  } catch (e) {
    console.error(e);
  }

  // 6. 페이로드 길이 4 byte
  const payloadLengthBuffer = Buffer.alloc(config.header.service.payloadLength);
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
