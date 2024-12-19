// 클러스터링을 위해 서비스가 마스터 서버 형태를 갖추어야 함.
import cluster from 'cluster';
import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import config from '@peekaboo-ssr/config/game';
import RedisManager from '@peekaboo-ssr/classes/RedisManager';
import PubSubManager from '@peekaboo-ssr/classes/PubSubManager';
import G2SEventHandler from '@peekaboo-ssr/events/G2SEvent';
import { handlers } from './handlers/index.js';
import express from 'express';
import client from 'prom-client';
import pidusage from 'pidusage';

class GameServer extends TcpServer {
  constructor() {
    super('game', config.game.host, config.game.port, new G2SEventHandler());

    this.handlers = handlers;

    this.redisManager = new RedisManager(); // RedisManager 인스턴스 생성
    this.pubSubManager = new PubSubManager(this.redisManager); // PubSubManager 프로퍼티로 추가

    this.dedicatedMaps = new Map(); // Dedicated 서버를 담은 Map (Key : gameId, Value: workerId)

    this.games = new Map();

    this.initializeSubscriber();

    this.connectToDistributor(
      config.distributor.host,
      config.distributor.port,
      (data) => {
        // 이건 이제 접속하고 등록절차를 밟으면 noti를 콜백으로 호출하는 것
        console.log('Distributor Notification: ', data);
      },
    );
  }
}

async function initializeMetrics() {
  const app = express();
  const register = new client.Registry();

  // 서비스 설정
  const serviceName = 'account'; // 현재 서비스 이름
  const PORT = Number(config.game.port) + 2000; // Prometheus HTTP 포트

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

  // /metrics 엔드포인트
  app.get('/metrics', async (req, res) => {
    console.log(`[Account] Metric Request`);
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  // HTTP 서버 실행
  app.listen(PORT, () => {
    console.log(
      `[Account] prometheus metrics server for ${serviceName} running on port ${PORT}`,
    );
  });
}

if (cluster.isPrimary) {
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });

  await initializeMetrics();
} else {
  new GameServer();
}

// if (cluster.isPrimary) {
//   new GameServer();

//   cluster.setupPrimary({
//     exec: path.join(__dirname, '../../dedicated/src/dedicated.server.js'),
//     args: [],
//     execArgv: [],
//   });
// }
