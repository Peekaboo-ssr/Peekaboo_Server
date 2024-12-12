// src/packet/packetHelper.js

export class PacketHelper {
  constructor(protoLoader, headerConfig, clientPacketMaps) {
    this.protoLoader = protoLoader;
    this.headerConfig = headerConfig;
    this.sequence = 1;
    this.clientPacketMaps = clientPacketMaps;
  }

  createPacket(packetType, payload) {
    const { version } = this.headerConfig;

    const packetTypeBuffer = Buffer.alloc(2);
    packetTypeBuffer.writeUInt16BE(packetType, 0);

    const versionLength = version.length;
    const versionLengthBuffer = Buffer.alloc(1);
    versionLengthBuffer.writeUInt8(versionLength, 0);
    const versionBuffer = Buffer.from(version, 'utf-8');

    const sequenceBuffer = Buffer.alloc(4);
    sequenceBuffer.writeUInt32BE(this.sequence, 0);
    this.sequence += 1;

    const gamePacket = this.protoLoader.getMessage('common', 'GamePacket');
    const packet = {};
    packet[this.clientPacketMaps[packetType]] = payload;
    const payloadBuffer = gamePacket.encode(packet).finish();

    const payloadLengthBuffer = Buffer.alloc(4);
    payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

    return Buffer.concat([
      packetTypeBuffer,
      versionLengthBuffer,
      versionBuffer,
      sequenceBuffer,
      payloadLengthBuffer,
      payloadBuffer,
    ]);
  }

  parsePacket(data) {
    let offset = 0;
    const packetType = data.readUInt16BE(offset);
    offset += 2;

    const versionLength = data.readUInt8(offset);
    offset += 1;

    const version = data
      .subarray(offset, offset + versionLength)
      .toString('utf-8');
    offset += versionLength;

    const sequence = data.readUInt32BE(offset);
    offset += 4;

    const payloadLength = data.readUInt32BE(offset);
    offset += 4;

    const payloadBuffer = data.subarray(offset, offset + payloadLength);
    offset += payloadLength;

    const gamePacket = this.protoLoader.getMessage('common', 'GamePacket');
    let payloadData;
    try {
      payloadData = gamePacket.decode(payloadBuffer);
    } catch (e) {
      console.error('Failed to decode payload:', e);
      return { packetType, version, sequence, payload: null };
    }

    let extractedPayload = null;
    for (const key in payloadData) {
      if (
        payloadData.hasOwnProperty(key) &&
        typeof payloadData[key] === 'object'
      ) {
        extractedPayload = payloadData[key];
        break;
      }
    }

    return { packetType, version, sequence, payload: extractedPayload };
  }
}
