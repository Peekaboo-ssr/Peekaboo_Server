import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import TcpClient from '@peekaboo-ssr/classes/TcpClient';
import RedisManager from '@peekaboo-ssr/classes/RedisManager';
import PubSubManager from '@peekaboo-ssr/classes/PubSubManager';
import config from '@peekaboo-ssr/config/gateway';
import C2GEventHandler from './events/onC2G.event.js';
import S2GEventHandler from './events/onS2G.event.js';
import cluster from 'cluster';
import { createRoutingTable } from './routes/create.routes.js';

class GatewayServer extends TcpServer {
  constructor() {
    super(
      'gateway',
      config.gateway.host,
      config.gateway.port,
      new C2GEventHandler(),
    );
    this.S2GEventHandler = new S2GEventHandler();
    this.index = 0;
    /**
     * connectClients
     * [clientKey]: {
     *    socket: socket,
     *    sequence: 1,
     *    gameSessionKey: `dedicateKey`
     * }
     */
    this.connectClients = {};
    this.mapClients = {
      microservices: {
        // client, info
      },
      dedicates: {
        // client, info, users, distributorKey
      },
    }; // 마이크로서비스들을 담기 위한 공간

    this.routingTable = createRoutingTable(config.clientPacket);

    this.redisManager = new RedisManager(); // RedisManager 인스턴스 생성
    this.pubSubManager = new PubSubManager(this.redisManager); // PubSubManager 프로퍼티로 추가
    this.initializeSubscriber();

    this.connectToDistributor(
      config.distributor.host,
      config.distributor.port,
      (data) => {
        console.log('Distributor Notification: ', data);
      },
    );
  }

  // 각 서비스간 연결이 필요
  // 게이트웨이 this.mapClients에 연결된 노드 정보를 저장하는 함수
  async onDistribute(data) {
    //data에 Services 와 Dedicates 가 동시에 존재하여 병렬로 연결작업을 진행하는게 좋아보임.
    const connectServices = data.microservices.map((service) => {
      const node = service;
      const key = node.host + ':' + node.port;
      if (!this.mapClients.microservices[key] && node.name !== 'gateway') {
        const client = new TcpClient(
          node.host,
          node.port,
          (options) => {
            this.S2GEventHandler.onConnection(client);
          },
          (options, data) => {
            this.S2GEventHandler.onData(client, data, this.connectClients);
          },
          () => {
            this.S2GEventHandler.onEnd(client);
          },
          () => {
            this.S2GEventHandler.onError(client);
          },
        );
        this.mapClients.microservices[key] = {
          client: client,
          info: node,
        };
        client.connect();
      }
    });

    const connectDedicates = data.dedicates.map((dedicated) => {
      const node = dedicated;
      const key = node.host + ':' + node.port;
      if (!this.mapClients.dedicates[key]) {
        const client = new TcpClient(
          node.host,
          node.port,
          (options) => {
            this.S2GEventHandler.onConnection(client);
          },
          (options, data) => {
            this.S2GEventHandler.onData(client, data, this.connectClients);
          },
          () => {
            this.S2GEventHandler.onEnd(client);
          },
          () => {
            this.S2GEventHandler.onError(client);
          },
        );
        this.mapClients.dedicates[key] = {
          client: client,
          info: node,
          distributorKey: null,
          users: [],
        };
        client.connect();
      }
    });

    await Promise.all([...connectServices, ...connectDedicates]);
  }
}

if (cluster.isPrimary) {
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  new GatewayServer();
}
