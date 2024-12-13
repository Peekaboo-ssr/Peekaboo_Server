import net from 'net';
import { config } from './config/config.js';
import { PACKET_TYPE } from './constants/packet.js';
import RedisManager from './classes/managers/redisManager.js';
import { createPacketS2S } from './utils/packet/create.packet.js';
import G2SEventHandler from './events/onG2S.event.js';
import D2SEventHandler from './events/onD2S.event.js';
import { handlers } from './handlers/index.js';
import Game from './classes/models/game.class.js';
import User from './classes/models/user.class.js';
import { loadProtos } from './init/load.protos.js';
import { loadGameAssets } from './init/load.assets.js';

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
    this.handlers = handlers;
    this.redisClient = RedisManager.getClient(); // Redis 클라이언트 생성
    this.initServer(id, inviteCode);
    this.connectToDistributor(
      'host.docker.internal', //ec2에 사용 시 172.17.0.1로로
      config.server.distributor.port,
      () => {
        // S2S로 호스트 유저를 맵에 등록하도록 요청
        const dedicateKey = `${this.context.host}:${this.context.port}`; // 이거 안됨. 127.0.0.1:3600  172.0.0.2:3500    3600:3500
        const distributorKey = `${this.clientToDistributor.client.localAddress}:${this.clientToDistributor.client.localPort}`;
        const packet = createPacketS2S(
          PACKET_TYPE.service.CreateDedicatedRequest,
          'dedicated',
          'gateway',
          {
            hostKey: clientKey,
            dedicateKey,
            distributorKey,
            gameSessionId: this.game.id,
            inviteCode: this.game.inviteCode,
          },
        );
        this.clientToDistributor.write(packet);
        // 호스트 유저를 생성하여 저장
        this.game.addUser(new User(userId, clientKey), true);
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
    });

    await loadProtos();
    await loadGameAssets();
    this.game = new Game(id, inviteCode); // 현재 서버의 게임 클래스
    // setGameRedis(this.game.id, this.game.inviteCode, this.game.state);
  }

  connectToDistributor(host, port, notification) {
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

// new DedicateServer('clientKey', 'gameId', 'userId');

/**
 * CreateReq
 * 1. 마스터서버에서 dedicate 생성
 * 2. 호스트유저 addUser
 * 3. gameSessionKey, dedicateKey, inviteCode => 세션 서비스에 pub/sub
 * 4. 세션 서비스에 위 정보가 담긴 게임 세션들을 저장.
 *
 * 만약 데디/마스터 모두 joinReq를 받는다고 가정했을 때,
 * 1. 클라에서 보낸 joinRoomReq를 마스터서버에서 세션 서비스에 요청하여 dedicateKey를 찾음.
 * 2. S2S 게이트웨이에 해당 dedicateKey 데디에 joinRoomReq를 보냄 servicePacket
 * 3. 데디는 joinRoomReq를 받으면 addUser 하도록 함.
 *
 *
 * 대기실 리스트에서 게임을 참가한다고 했을 때,
 * 1. joinRoomRequest 를 2개로 나누는 형태로 가져감
 * 2. joinRoomByInviteReq , joinRoomByIdReq 형태
 * 3. joinRoomByInviteReq 는 페이로드로 inviteCode를 받아서 세션 서비스에 찾도록 요청
 * 4. joinRoomByIdReq 는 페이로드로 gameSessionId를 받아서 세션 서비스에 찾도록 요청
 * 5. 두 요청 모두 마스터 서버에서 다루어지면 됨.
 */
