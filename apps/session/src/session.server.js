// 세션 서버
import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import config from '@peekaboo-ssr/config/session';
import RedisManager from '@peekaboo-ssr/classes/RedisManager';
import PubSubManager from '@peekaboo-ssr/classes/PubSubManager';
import G2SEventHandler from '@peekaboo-ssr/events/G2SEvent';
import { handlers } from './handlers/index.js';
import cluster from 'cluster';
import express from 'express';
import client from 'prom-client';
import pidusage from 'pidusage';

class SessionServer extends TcpServer {
  constructor() {
    super(
      'session',
      config.session.host,
      config.session.port,
      new G2SEventHandler(),
    );

    this.handlers = handlers;
    this.gateSocket = null;

    this.gameSessions = {};
    this.userSessions = {};

    this.redisManager = new RedisManager(); // RedisManager 인스턴스 생성
    this.pubSubManager = new PubSubManager(this.redisManager); // PubSubManager 프로퍼티로 추가
    this.initializeSubscriber();

    this.initializeSession();

    this.connectToDistributor(
      config.distributor.host,
      config.distributor.port,
      (data) => {
        // 이건 이제 접속하고 등록절차를 밟으면 noti를 콜백으로 호출하는 것
        console.log('Distributor Notification: ', data);
      },
    );
  }

  initializeSession() {
    setInterval(() => {
      if (Object.keys(userSessions).length > 0) {
        console.log('현재 접속한 유저 정보: ', userSessions);
      }
    }, 5000);
  }
}

async function initializeMetrics() {
  const app = express();
  const register = new client.Registry();

  // 서비스 설정
  const serviceName = 'account'; // 현재 서비스 이름
  const PORT = Number(config.session.port) + 2000; // Prometheus HTTP 포트

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
  new SessionServer();
}
