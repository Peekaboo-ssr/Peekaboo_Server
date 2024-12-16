// 클러스터링을 위해 서비스가 마스터 서버 형태를 갖추어야 함.
import cluster from 'cluster';
import os from 'os';
import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import config from '@peekaboo-ssr/config/game';
import RedisManager from '@peekaboo-ssr/classes/RedisManager';
import PubSubManager from '@peekaboo-ssr/classes/PubSubManager';
import G2SEventHandler from '@peekaboo-ssr/events/G2SEvent';
import { handlers } from './handlers/index.js';

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
if (cluster.isPrimary) {
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
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
