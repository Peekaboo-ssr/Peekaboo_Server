// src/config/config.js
import CLIENT_PACKET from '../../packages/modules/constants/packet/client.packet.js';
import CLIENT_PACKET_MAPS from '../../packages/modules/constants/protoNames/client.proto.js';

export const headerConfig = {
  typeLength: 2,
  versionLengthField: 1,
  sequenceLength: 4,
  payloadLength: 4,
  version: '1.0.0',
};

export const packetNames = {
  common: {
    GamePacket: 'common.GamePacket',
    ServicePacket: 'common.ServicePacket',
  },
};

export { CLIENT_PACKET, CLIENT_PACKET_MAPS };
