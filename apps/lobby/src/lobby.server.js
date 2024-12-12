// 로비 서버
import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import config from '@peekaboo-ssr/config/lobby';
import RedisManager from '@peekaboo-ssr/classes/RedisManager';
import PubSubManager from '@peekaboo-ssr/classes/PubSubManager';
import G2SEventHandler from './events/onG2S.event.js';
import { handlers } from './handlers/index.js';
import { Room } from './classes/models/room.class.js';
import { rooms } from '../room/room.js';
import cluster from 'cluster';

class LobbyServer extends TcpServer {
  constructor() {
    super('lobby', config.lobby.host, config.lobby.port, new G2SEventHandler());

    this.handlers = handlers;

    this.redisManager = new RedisManager(); // RedisManager 인스턴스 생성
    this.pubSubManager = new PubSubManager(this.redisManager); // PubSubManager 프로퍼티로 추가
    this.initializeSubscriber();

    this.connectToDistributor(
      config.distributor.host,
      config.distributor.port,
      (data) => {
        // 이건 이제 접속하고 등록절차를 밟으면 noti를 콜백으로 호출하는 것
        console.log('Distributor Notification: ', data);
      },
    );
    rooms.push(new Room('tempId001', 'EXAMPLE'));
    rooms.push(new Room('tempId002', 'EXAMPLE'));
  }
}
if (cluster.isPrimary) {
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  new LobbyServer();
}
