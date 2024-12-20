import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import config from '@peekaboo-ssr/config/game';

class User {
  constructor(id, clientKey) {
    // 유저 기본 정보
    this.id = id;
    this.clientKey = clientKey;
    this.state = config.clientState.userState.INGAME;
    this.exp = 0;

    // 게임 관련 정보
    this.gameId = null;
    this.character = null;
  }

  attachCharacter(character) {
    if (!this.character) {
      this.character = character;
      return;
    }
    console.error('이미 존재하는 캐릭터가 있습니다.');
  }

  setGameId(gameId) {
    this.gameId = gameId;
  }

  // 핑을 보내주고 또 보내라고 요청도 보내고
  ping(socket) {
    const now = Date.now();

    const pingPacket = createPacketS2G(
      config.clientPacket.dedicated.PingRequest,
      this.clientKey,
      {
        timestamp: now,
      },
    );

    socket.write(pingPacket);
  }

  /**
   * 클라이언의 응답에을 받으면 실행하는 함수
   * 받은 핑(data)의 타임스탬프를 이용해 해당 유저의 레이턴시를 구하는 함수
   */
  receivePing(data) {
    const now = Date.now();
    this.character.latency = (now - data.timestamp) / 2;
    // console.log(
    //   `Received pong from user ${this.id} at ${now} with latency ${this.character.latency}ms`,
    // );
  }
}

export default User;
