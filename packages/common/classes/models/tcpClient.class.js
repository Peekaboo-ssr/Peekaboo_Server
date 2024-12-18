import net from 'net';

// 이건 마이크로서비스 Distributor에 등록될 TcpClient가 되기 위해 클래스화 한 것
class TcpClient {
  constructor(host, port, onCreate, onRead, onEnd, onError) {
    // 연결할 distributor의 host, port 를 설정
    // 혹은 서비스
    this.options = {
      host: host,
      port: port,
    };

    // 여기는 현재 서비스가 Distributor와 이벤트에 따라
    // 생성자 인자로 받은 onCreate, onRead, onEnd, onError 콜백함수를 호출하게 됨.
    // 어떤 로직이 처리되는가는 TcpServer 클래스에 있을 것.
    this.onCreate = onCreate;
    this.onRead = onRead;
    this.onEnd = onEnd;
    this.onError = onError;

    // Distributor 혹은 서비스를 여기에 저장
    this.client = null;

    // 버퍼를 받기 때문에 헤더/페이로드를 검증하는 절차가 필요하여 보내줘야함.
    this.buffer = Buffer.alloc(0);
  }

  // Distributor 혹은 서비스에 연결하기 위한 메서드
  connect() {
    this.client = net.connect(this.options, () => {
      // distributor에 해당 서비스 클라이언트를 생성 및 등록 요청
      if (this.onCreate) this.onCreate(this.options);
    });

    // 데이터 수신 처리
    this.client.on('data', (data) => {
      this.onRead(this, data);
    });

    // 연결 종료 처리
    this.client.on('end', () => {
      this.onEnd(this.client);
    });

    // 에러 처리
    this.client.on('error', (err) => {
      this.onError(this.client, err);
    });
  }

  // Distributor로 데이터를 전송하는 메서드
  write(buffer) {
    this.client.write(buffer);
  }
}

export default TcpClient;
