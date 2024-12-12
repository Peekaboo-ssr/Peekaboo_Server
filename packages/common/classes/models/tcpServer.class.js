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

    this.server.listen(this.context.port === 0 ? 0 : this.context.port, () => {
      console.log(
        `${this.context.name} 서버가 대기 중: `,
        this.server.address(),
      );
      this.context.port = this.server.address().port;
    });
  }

  // ---------- Distributor에 연결된 클라이언트 혹은 서비스에 연결된 게이트웨이의 클라이언트 부분 ------------
  connectToDistributor(host, port, notification) {
    this.clientToDistributor = new TcpClient(
      host,
      port,
      (options) => {
        this.onD2SEvent.onConnection(this);
        if (this.context.name === 'dedicated') notification();
      },
      (options, data) => {
        this.onD2SEvent.onData(this, data);
      },
      (options) => {
        this.onD2SEvent.onEnd(this);
      },
      (options, err) => {
        this.onD2SEvent.onError(this);
      },
    );

    setInterval(() => {
      if (this.isConnectedDistributor != true) {
        this.clientToDistributor.connect();
      }
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

    this.pubSubManager.subscriber.on('message', (channel, message) => {
      if (channel === requestChannel) {
        try {
          const data = JSON.parse(message);
          const handler = this.getRedisHandlerByAction(data.action);
          handler(this, data);
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
