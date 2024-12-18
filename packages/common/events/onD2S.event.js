import BaseEvent from '@peekaboo-ssr/events/BaseEvent';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import serviceHeader from '@peekaboo-ssr/modules-constants/serviceHeader';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import { parsePacketS2S } from '@peekaboo-ssr/utils/parsePacket';

class D2SEventHandler extends BaseEvent {
  onConnection(server) {
    console.log(
      `${server.context.name}의 Client connected Distributor: ${server.clientToDistributor.options.host}:${server.clientToDistributor.options.port}`,
    );
    server.isConnectedDistributor = true;

    // 서비스가 Distributor와 연결되었을 때 등록 요청을 보냄
    const registPacket = {
      host: server.context.host,
      port: server.context.port,
      name: server.context.name,
    };

    const buffer = createPacketS2S(
      servicePacket.ConnectServiceRequest,
      server.context.name,
      'distributor',
      registPacket,
    );
    server.clientToDistributor.write(buffer);
  }

  async onData(server, data) {
    // 콜백으로 넘어가기 전 헤더와 페이로드 검증 필요
    server.clientToDistributor.buffer = Buffer.concat([
      server.clientToDistributor.buffer,
      data,
    ]);

    while (
      server.clientToDistributor.buffer.length >= serviceHeader.typeLength
    ) {
      let offset = 0;
      const packetType = server.clientToDistributor.buffer.readUint16BE(offset);
      offset += serviceHeader.typeLength;

      const senderLength = server.clientToDistributor.buffer.readUInt8(offset);
      offset += serviceHeader.senderLength;

      const sender = server.clientToDistributor.buffer
        .subarray(offset, offset + senderLength)
        .toString();
      offset += senderLength;

      const receiverLength =
        server.clientToDistributor.buffer.readUInt8(offset);
      offset += serviceHeader.receiverLength;

      const receiver = server.clientToDistributor.buffer
        .subarray(offset, offset + receiverLength)
        .toString();
      offset += receiverLength;

      const payloadLength =
        server.clientToDistributor.buffer.readUint32BE(offset);
      offset += serviceHeader.payloadLength;

      const totalPacketLength = offset + payloadLength;

      if (server.clientToDistributor.buffer.length < totalPacketLength) {
        break;
      }
      const payloadBuffer = server.clientToDistributor.buffer.subarray(
        offset,
        offset + payloadLength,
      );
      try {
        const payload = parsePacketS2S(packetType, payloadBuffer);

        server.clientToDistributor.buffer =
          server.clientToDistributor.buffer.subarray(totalPacketLength);

        const handler = server.getServiceHandlerByPacketType(packetType);

        await handler(server, payload);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onEnd(server) {
    console.log('Distributor connection ended');
    server.isConnectedDistributor = false;
  }

  onError(server, err) {
    console.error('Error with Distributor connection:', err);
    server.isConnectedDistributor = false;
  }
}

export default D2SEventHandler;
