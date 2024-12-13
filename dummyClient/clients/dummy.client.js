import net from 'net';

// src/client/dummyClient.js
export class DummyClient {
  constructor({ host = '0.0.0.0', port = 6000, packetHelper, CLIENT_PACKET }) {
    this.host = host;
    this.port = port;
    this.packetHelper = packetHelper;
    this.CLIENT_PACKET = CLIENT_PACKET;
    this.client = null;
    this.moveInterval = null;

    // 패킷 응답 대기용 맵: Map<packetType, {resolve, reject}>
    this.responseWaiters = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = net.connect({ host: this.host, port: this.port }, () => {
        console.log('Connected to server.');
        resolve();
      });

      this.client.on('data', (data) => this.onData(data));
      this.client.on('end', () => console.log('Connection ended by server.'));
      this.client.on('error', (err) => console.error('Connection error:', err));
    });
  }

  onData(data) {
    const { packetType, version, sequence, payload } =
      this.packetHelper.parsePacket(data);
    console.log('Received Packet:', { packetType, payload });
    // 만약 해당 packetType을 기다리는 Promise가 있다면 resolve
    const waiter = this.responseWaiters.get(packetType);
    if (waiter) {
      waiter.resolve(payload);
      this.responseWaiters.delete(packetType); // 한 번 응답 받은 뒤 제거
    }

    // 예: Ping 요청 처리
    if (packetType === this.CLIENT_PACKET.dedicated.PingRequest) {
      const { timestamp } = payload;
      const pong = this.packetHelper.createPacket(
        this.CLIENT_PACKET.dedicated.PingResponse,
        { timestamp },
      );
      this.client.write(pong);
    }
  }

  sendPacket(packetType, payload) {
    const buffer = this.packetHelper.createPacket(packetType, payload);
    this.client.write(buffer);
  }

  // 특정 packetType 응답 대기
  waitForResponse(packetType, timeout = 10000) {
    return new Promise((resolve, reject) => {
      // 이미 기다리는 응답이 있다면 중복 등록 에러 처리 가능
      if (this.responseWaiters.has(packetType)) {
        return reject(
          new Error(`Already waiting for response of packetType ${packetType}`),
        );
      }

      this.responseWaiters.set(packetType, { resolve, reject });

      // 타임아웃 설정
      setTimeout(() => {
        if (this.responseWaiters.has(packetType)) {
          this.responseWaiters.delete(packetType);
          reject(
            new Error(
              `Response timed out after ${timeout}ms for packetType ${packetType}`,
            ),
          );
        }
      }, timeout);
    });
  }

  close() {
    if (this.moveInterval) clearInterval(this.moveInterval);
    this.client.destroy();
    console.log('Connection destroyed');
  }
}
