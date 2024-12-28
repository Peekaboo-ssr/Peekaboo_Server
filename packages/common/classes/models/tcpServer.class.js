// TCP Server 클래스를 선언 및 정의한 곳,
// TCP 서버 서비스 노드를 생성시키고 각 데이터 송수신, 연결 수립, 연결 종료, 에러에 따른 행동을 정의

import net from 'net';
import TcpClient from '@peekaboo-ssr/classes/TcpClient';
import D2SEventHandler from '@peekaboo-ssr/events/D2SEvent';

class TcpServer {
  constructor(name, host, port, event) {
    // 마이크로서비스 정보
    this.context = {
      host: host,
      port: port,
      name: name,
    };
    this.event = event;
    this.isConnectedDistributor = false;
    this.clientToDistributor = null;
    this.handlers = null;
    this.onD2SEvent = new D2SEventHandler();
    this.gateSocket = null;

    this.initServer();
  }

  // TCP 서버를 열고 초기화
  initServer() {
    // 서버를 생성
    this.server = net.createServer((socket) => {
      this.event.onConnection(socket, this);
      socket.on('data', (data) => this.event.onData(socket, data, this));
      socket.on('end', () => this.event.onEnd(socket, this));
      socket.on('error', (err) => this.event.onError(socket, err, this));
    });

    const serverOptions = {
      host: this.context.host,
      port: this.context.port === 0 ? 0 : this.context.port,
    };
    console.log('context', this.context);

    this.server.listen(serverOptions, () => {
      console.log(
        `${this.context.name} 서버가 대기 중: `,
        this.server.address(),
      );
      console.log('Trying to Server:', serverOptions);
      this.context.port = this.server.address().port;
    });
  }

  // ---------- Distributor에 연결된 클라이언트 혹은 서비스에 연결된 게이트웨이의 클라이언트 부분 ------------
  connectToDistributor(host, port, notification) {
    console.log('Connecting to distributor with:', { host, port });

    // Docker 네트워크에서는 service name인 'distributor'를 사용
    this.clientToDistributor = new TcpClient(
      'distributor', // docker-compose에서 정의한 서비스 이름
      port,
      (options) => {
        console.log('Connected to distributor, sending registration packet');
        this.isConnectedDistributor = true;
        this.onD2SEvent.onConnection(this);
        if (this.context.name === 'dedicated') notification();
      },
      (options, data) => {
        // console.log('Received data from distributor:', data);
        this.onD2SEvent.onData(this, data);
      },
      (options) => {
        console.log('Distributor connection ended');
        this.isConnectedDistributor = false;
        this.onD2SEvent.onEnd(this);
      },
      (options, err) => {
        console.log('Distributor connection error:', err);
        this.isConnectedDistributor = false;
        this.onD2SEvent.onError(this);
      },
    );

    const tryConnect = () => {
      if (!this.isConnectedDistributor) {
        console.log('Attempting to connect to distributor...');
        try {
          this.clientToDistributor.connect();
        } catch (err) {
          console.error('Connection attempt failed:', err);
        }
      }
    };

    tryConnect();

    setInterval(() => {
      tryConnect();
    }, 3000);
  }

  initializeSubscriber() {
    const requestChannel = `${this.context.name}_service_request`;

    this.pubSubManager.subscriber.subscribe(requestChannel, (err) => {
      if (err) {
        console.error(`Error subscribing to ${requestChannel}:`, err);
      } else {
        console.log(`Subscribed to ${requestChannel}`);
      }
    });

    this.pubSubManager.subscriber.on('message', async (channel, message) => {
      if (channel === requestChannel) {
        try {
          const data = JSON.parse(message);
          const handler = this.getRedisHandlerByAction(data.action);
          await handler(this, data);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  getRedisHandlerByAction = (action) => {
    if (!this.handlers.pubsub[action]) {
      console.error('Redis handler not found!!');
      return false;
    }
    return this.handlers.pubsub[action].handler;
  };

  getClientHandlerByPacketType = (packetType) => {
    if (!this.handlers.client[packetType]) {
      console.error('PacketType handler not found!!');
      return false;
    }
    return this.handlers.client[packetType].handler;
  };

  getServiceHandlerByPacketType = (packetType) => {
    if (!this.handlers.service[packetType]) {
      console.error('PacketType handler not found!!');
      return false;
    }
    return this.handlers.service[packetType].handler;
  };

  getReceiverFromServiceMap = () => {};
}

export default TcpServer;
