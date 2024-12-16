import net from 'net';
import { config } from './config/config.js';
import { PACKET_TYPE } from './constants/packet.js';
import { createPacketS2S } from './utils/packet/create.packet.js';
import { setGameRedis } from './redis/game.redis.js';
import G2SEventHandler from './events/onG2S.event.js';
import D2SEventHandler from './events/onD2S.event.js';
import { handlers } from './handlers/index.js';
import Game from './classes/models/game.class.js';
import User from './classes/models/user.class.js';
import { loadProtos } from './init/load.protos.js';
import { loadGameAssets } from './init/load.assets.js';
import { sendCreateRoomResponse } from './response/room/room.response.js';

class DedicateServer {
  constructor(clientKey, id, inviteCode, userId) {
    // 마이크로서비스 정보
    this.context = {
      host: config.server.game.host,
      port: port,
      name: 'dedicated',
    };
    this.event = new G2SEventHandler();
    this.onD2SEvent = new D2SEventHandler();
    this.isConnectedDistributor = false;
    this.clientToDistributor = null;
    this.game = null;
    this.handlers = handlers;

    this.initialize(id, inviteCode, userId, clientKey);
  }

  async initialize(id, inviteCode, userId, clientKey) {
    await this.initServer();
    await this.connectToDistributor(
      'host.docker.internal', // EC2: 172.17.0.1 or local: host.docker.internal
      config.server.distributor.port,
      () => {
        // 게임 인스턴스 생성
        this.game = new Game(id, inviteCode);
        // S2S로 호스트 유저를 맵에 등록하도록 요청
        const dedicateKey = `${this.context.host}:${this.context.port}`;
        const distributorKey = `${this.clientToDistributor.client.localAddress}:${this.clientToDistributor.client.localPort}`;
        const packet = createPacketS2S(
          PACKET_TYPE.service.CreateDedicatedRequest,
          'dedicated',
          'gateway',
          {
            hostKey: clientKey,
            dedicateKey,
            distributorKey,
            gameSessionId: id,
            inviteCode: inviteCode,
          },
        );
        this.clientToDistributor.write(packet);
      },
    );
    setTimeout(() => {
      setInterval(async () => {
        // 게임이 초기화 되었고, 호스트아이디가 빈 값일 때, 호스트를 참가시키고 응답하도록 수행
        if (this.game.isInit === true && this.game.hostId === null) {
          await this.initializeGame(id, inviteCode, userId, clientKey);
        }
      }, 2000);
    }, 5000);
  }

  async initServer() {
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
    });

    await loadProtos();
    await loadGameAssets();
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

class TcpClient {
  constructor(host, port, onCreate, onRead, onEnd, onError) {
    this.options = {
      host: host,
      port: port,
    };
    this.onCreate = onCreate;
    this.onRead = onRead;
    this.onEnd = onEnd;
    this.onError = onError;
    this.client = null;
    this.buffer = Buffer.alloc(0);
  }

  connect() {
    this.client = net.connect(this.options, () => {
      if (this.onCreate) this.onCreate(this.options);
    });

    this.client.on('data', (data) => {
      this.onRead(this, data);
    });

    this.client.on('end', () => {
      this.onEnd(this.client);
    });

    this.client.on('error', (err) => {
      this.onError(this.client, err);
    });
  }

  write(buffer) {
    this.client.write(buffer);
  }
}

const gameId = process.env.GAME_ID;
const clientKey = process.env.CLIENT_KEY;
const inviteCode = process.env.INVITE_CODE;
const userId = process.env.USER_ID;
const port = process.env.PORT;

new DedicateServer(clientKey, gameId, inviteCode, userId);
