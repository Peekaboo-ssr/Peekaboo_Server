import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import TcpClient from '@peekaboo-ssr/classes/TcpClient';
import RedisManager from '@peekaboo-ssr/classes/RedisManager';
import PubSubManager from '@peekaboo-ssr/classes/PubSubManager';
import config from '@peekaboo-ssr/config/gateway';
import C2GEventHandler from './events/onC2G.event.js';
import S2GEventHandler from './events/onS2G.event.js';
import cluster from 'cluster';
import { createRoutingTable } from './routes/create.routes.js';
import express from 'express';
import client from 'prom-client';
import { handlers } from './handlers/index.js';
import pidusage from 'pidusage';

class GatewayServer extends TcpServer {
  constructor() {
    super(
      'gateway',
      config.gateway.host,
      config.gateway.port,
      new C2GEventHandler(),
    );
    this.S2GEventHandler = new S2GEventHandler();
    this.handlers = handlers;
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

    this.initializeMetrics();
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
          node.name,
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
        console.log('새로운 데디케이티드와 연결: ', node);
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

  initializeMetrics() {
    const app = express();
    const register = new client.Registry();

    // 서비스 설정
    const serviceName = 'account'; // 현재 서비스 이름
    const PORT = Number(config.gateway.port) + 2000; // Prometheus HTTP 포트

    // 디폴트 레이블 등록
    register.setDefaultLabels({
      service: serviceName, // 서비스 이름 레이블
    });

    // 기본 메트릭 수집
    client.collectDefaultMetrics({ register });

    // CPU 사용률 계산
    const cpuUsageGauge = new client.Gauge({
      name: 'server_cpu_usage_percent',
      help: 'Current CPU usage percentage',
      async collect() {
        const stats = await pidusage(process.pid);
        cpuUsageGauge.set(Number(stats.cpu.toFixed(2)));
      },
    });
    register.registerMetric(cpuUsageGauge);

    // 메모리 사용량 계산
    const memoryUsageGauge = new client.Gauge({
      name: 'server_memory_usage_mb',
      help: 'Current memory usage in MB',
      async collect() {
        const stats = await pidusage(process.pid);
        memoryUsageGauge.set(Math.round(stats.memory / 1024 / 1024)); // MB 단위
      },
    });
    register.registerMetric(memoryUsageGauge);

    // 총 네트워크 트래픽 메트릭
    this.networkInCounter = new client.Counter({
      name: 'server_network_in_bytes',
      help: 'Total number of bytes received by the server',
    });
    register.registerMetric(this.networkInCounter);

    // 초당 네트워크 트래픽 메트릭
    const networkInRateGauge = new client.Gauge({
      name: 'server_network_in_bytes_per_second',
      help: 'Incoming network traffic in bytes per second',
    });
    register.registerMetric(networkInRateGauge);

    this.lastInCount = 0;
    setInterval(() => {
      const currentInCount = this.networkInCounter.hashMap?.['']?.value || 0;
      const inRate = (currentInCount - this.lastCount) / 5;

      networkInRateGauge.set(inRate >= 0 ? inRate : 0);
      this.lastInCount = currentInCount;
    }, 5000);

    // /metrics 엔드포인트
    app.get('/metrics', async (req, res) => {
      console.log(`[Account] Metric Request`);
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    });

    app.get('/network-traffic', (req, res) => {
      try {
        const networkIn = this.networkInCounter.hashMap?.['']?.value || 0;
        const networkInRate = networkInRateGauge.hashMap?.['']?.value || 0;

        res.json({
          network_in_bytes: networkIn,
          network_in_bytes_per_second: networkInRate,
        });
      } catch (error) {
        console.error(
          `[Gateway] Failed to fetch network traffic data: ${error}`,
        );
        res.status(500).json({ error: 'Failed to fetch network traffic data' });
      }
    });

    // HTTP 서버 실행
    app.listen(PORT, () => {
      console.log(
        `[Account] prometheus metrics server for ${serviceName} running on port ${PORT}`,
      );
    });
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
