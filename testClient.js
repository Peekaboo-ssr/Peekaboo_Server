// dummyClient.js
import net from 'net';

class DummyClient {
  constructor(host = 'localhost', port = 6000) {
    this.host = host;
    this.port = port;
    this.client = null;
    this.connected = false;
  }

  connect() {
    console.log(`Connecting to gateway at ${this.host}:${this.port}`);

    this.client = new net.Socket();

    this.client.connect(this.port, this.host, () => {
      console.log('Connected to gateway server');
      this.connected = true;

      // 테스트용 더미 데이터 전송
      this.sendDummyData();
    });

    this.client.on('data', (data) => {
      console.log('Received from server:', data);
      // 여기서 필요한 패킷 파싱 및 처리
    });

    this.client.on('close', () => {
      console.log('Connection closed');
      this.connected = false;
    });

    this.client.on('error', (err) => {
      console.error('Connection error:', err);
      this.connected = false;
    });
  }

  sendDummyData() {
    // 테스트용 더미 데이터 구조
    const dummyData = Buffer.alloc(8);
    dummyData.writeUInt16BE(1, 0); // 패킷 타입
    dummyData.writeUInt8(1, 2); // 버전 길이
    dummyData.write('1', 3); // 버전
    dummyData.writeUInt32BE(0, 4); // 페이로드 길이

    this.client.write(dummyData);
    console.log('Sent dummy data to server');
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}

// 테스트 실행
const client = new DummyClient();
client.connect();

// Ctrl+C 처리
process.on('SIGINT', () => {
  console.log('Disconnecting...');
  client.disconnect();
  process.exit();
});
