import net from 'net';
import config from '@peekaboo-ssr/config/game';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import { setGameRedis } from './redis/game.redis.js';
import G2SEventHandler from '@peekaboo-ssr/events/G2SEvent';
import D2SEventHandler from '@peekaboo-ssr/events/D2SEvent';
import { handlers } from './handlers/index.js';
import Game from './classes/models/game.class.js';
import User from './classes/models/user.class.js';
import { loadGameAssets } from './load.assets.js';
import { sendCreateRoomResponse } from './response/room/room.response.js';
import IntervalManager from './classes/managers/interval.manager.js';
import TcpClient from '@peekaboo-ssr/classes/TcpClient';

class DedicateServer {
  constructor(clientKey, id, inviteCode, userId) {
    // 마이크로서비스 정보
    this.context = {
      host: 'host.docker.internal', // EC2: 172.17.0.1 or local: host.docker.internal
      port: port,
      name: 'dedicated',
    };
    this.event = new G2SEventHandler();
    this.onD2SEvent = new D2SEventHandler();
    this.isConnectedDistributor = false;
    this.isCreatedToGateway = false;
    this.clientToDistributor = null;
    this.game = null;
    this.handlers = handlers;

    this.initialize(id, inviteCode, userId, clientKey);
  }

  async initialize(id, inviteCode, userId, clientKey) {
    await this.initServer(id, inviteCode);
    await this.connectToDistributor(
      'host.docker.internal', // EC2: 172.17.0.1 or local: host.docker.internal
      config.distributor.port,
      () => {
        setInterval(async () => {
          // 게임 인스턴스 생성 이후 연결 시도하도록 함.
          if (!this.game.isCreated && this.event.isConnected) {
            console.log('게이트웨이 연결됨.');
            // S2S로 호스트 유저를 맵에 등록하도록 요청
            const dedicateKey = `${this.context.host}:${this.context.port}`;
            const distributorKey = `${this.clientToDistributor.client.localAddress}:${this.clientToDistributor.client.localPort}`;
            const packet = createPacketS2S(
              config.servicePacket.CreateDedicatedRequest,
              'dedicated',
              'gateway',
              {
                hostKey: clientKey,
                dedicateKey,
                distributorKey,
                gameSessionId: id,
              },
            );
            this.clientToDistributor.write(packet);
            if (!this.game.isCreated) {
              this.game.isCreated = true;
              this.initializeGame(id, inviteCode, userId, clientKey);
            }
          }
        }, 2000);
      },
    );
  }

  async initServer(id, inviteCode) {
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

    await loadGameAssets();
    // 게임 인스턴스 생성
    this.game = new Game(id, inviteCode);
  }

  async connectToDistributor(host, port, notification) {
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

  async initializeGame(id, inviteCode, userId, clientKey) {
    // 레디스에 해당 게임 저장
    await setGameRedis(this.game.id, this.game.inviteCode, this.game.state);
    // 세션 서비스에 주기적으로 방 정보를 갱신하도록 요청
    IntervalManager.getInstance().addGameRoomInfoInterval(
      this.game.id,
      () => {
        const packetForSession = createPacketS2S(
          config.servicePacket.UpdateRoomInfoRequest,
          'dedicated',
          'session',
          {
            gameSessionId: this.game.id,
            numberOfPlayer: this.game.users.length,
            latency: Math.floor(this.game.users[0].character.latency),
            gameSessionState: this.game.state,
          },
        );
        this.clientToDistributor.write(packetForSession);
      },
      3500,
    );
    // createRoomResponse를 보내준다.
    console.log(
      `----------- createRoom Complete : ${this.game.id} -----------`,
    );
    // TODO: 유저에게 방 생성 완료 응답
    sendCreateRoomResponse(this.game.socket, clientKey, id, inviteCode);
    // 호스트 유저를 생성하여 저장
    this.game.addUser(new User(userId, clientKey), true);
  }

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
}

const gameId = process.env.GAME_ID;
const clientKey = process.env.CLIENT_KEY;
const inviteCode = process.env.INVITE_CODE;
const userId = process.env.USER_ID;
const port = process.env.PORT;

// new DedicateServer('clientKey', 'gameId', 'inviteCode', 'userId');
// const [clientKey, gameId, inviteCode, userId] = process.argv.slice(2);
new DedicateServer(clientKey, gameId, inviteCode, userId);
