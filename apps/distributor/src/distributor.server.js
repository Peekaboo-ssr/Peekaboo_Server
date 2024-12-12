// 각 마이크로서비스를 연결해주고 ip:port 를 게이트웨이에게 분배해주는 역할
import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import config from '@peekaboo-ssr/config/distributor';
import S2DEventHandler from './events/onS2D.event.js';
import { handlers } from './handlers/index.js';
import cluster from 'cluster';

class Distributor extends TcpServer {
  constructor() {
    super(
      'distributor',
      config.distributor.host,
      config.distributor.port,
      new S2DEventHandler(),
    );
    this.handlers = handlers;
  }
}

if (cluster.isPrimary) {
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  new Distributor();
}
