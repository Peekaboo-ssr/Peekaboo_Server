// 각 마이크로서비스를 연결해주고 ip:port 를 게이트웨이에게 분배해주는 역할
import TcpServer from '@peekaboo-ssr/classes/TcpServer';
import config from '@peekaboo-ssr/config/distributor';
import S2DEventHandler from './events/onS2D.event.js';
import { handlers } from './handlers/index.js';
import cluster from 'cluster';
import express from 'express';
import { serviceMap } from './source/connection.source.js';

class Distributor extends TcpServer {
  constructor() {
    super(
      'distributor',
      config.distributor.host,
      config.distributor.port,
      new S2DEventHandler(),
    );
    this.handlers = handlers;

    const prometheusApp = express();
    const PORT = Number(config.distributor.port) + 2000;

    prometheusApp.get('/prometheus/targets', (req, res) => {
      console.log(`[Distributor] prometheus targets request`);
      const targets = [];

      for (const [key, value] of Object.entries(serviceMap.microservices)) {
        const serviceKey =
          config.monitor.host +
          ':' +
          (Number(value.info.port) + 2000).toString();
        targets.push({
          targets: [serviceKey],
          labels: { job: value.info.name },
        });
      }

      for (const [key, value] of Object.entries(serviceMap.dedicates)) {
        targets.push({
          targets: [key],
          labels: { job: 'dedicated' },
        });
      }

      res.json(targets);
    });

    prometheusApp.listen(PORT, () => {
      console.log(`Distributor server Monitor Listening Start: ${PORT}`);
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
  new Distributor();
}
