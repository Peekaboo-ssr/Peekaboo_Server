import IntervalManager from '../managers/interval.manager.js';
import { CHARACTER_STATE, GAME_SESSION_STATE } from '../../constants/state.js';
import { Character } from './character.class.js';
import { ghostsLocationNotification } from '../../notifications/ghost/ghost.notification.js';
import {
  disconnectPlayerNotification,
  remainingTimeNotification,
  stageEndNotification,
} from '../../notifications/system/system.notification.js';
import ItemQueueManager from '../managers/itemQueueManager.js';
import DoorQueueManager from '../managers/doorQueueManager.js';
import { Door } from './door.class.js';
import { config } from '../../config/config.js';
import gameAssets from '../../init/load.assets.js';
import { setGameStateRedis } from '../../redis/game.redis.js';

class Game {
  constructor(id, inviteCode) {
    this.id = id;
    this.socket = null; // 자체적으로 게이트웨이에 보내기 위한 socket
    this.hostId = null;
    this.users = [];
    this.ghosts = [];
    this.items = [];
    this.doors = [];
    this.state = GAME_SESSION_STATE.PREPARE;
    this.ghostSpawnPositions = null;
    this.difficultyId = null;
    this.remainingTime = null;
    this.ghostCSpawn = false;
    this.assets = { ...gameAssets };

    this.goalSoulAmount = 0;
    this.soulAccumulatedAmount = 1000;
    this.ghostIdCount = 1;

    this.inviteCode = inviteCode;
    this.itemQueue = new ItemQueueManager(id);
    this.doorQueue = new DoorQueueManager(id);

    this.initDoors();
  }

  async startGame() {
    // 게임 상태 변경
    await this.setState(GAME_SESSION_STATE.INPROGRESS);

    // 게임 남은 시간 초기화
    this.remainingTime = this.gameAssets.difficulty.data.find(
      (data) => data.id === this.difficultyId,
    );

    // 귀신 스폰 가능 지점 초기화
    this.ghostSpawnPositions = [this.gameAssets.ghostSpawnPos.data];

    // IntervalManager.getInstance().addPlayersInterval(
    //   this.id,
    //   () => usersLocationNotification(this),
    //   1000 / 60,
    // );

    IntervalManager.getInstance().addGhostsInterval(
      this.id,
      () => ghostsLocationNotification(this),
      100,
    );

    IntervalManager.getInstance().addGameMonitorInterval(
      this.id,
      this.printGameInfo.bind(this),
      3000,
    );

    // IntervalManager.getInstance().addGameTimerInterval(
    //   this.id,
    //   this.gameTimer.bind(this),
    //   1000,
    // );
  }

  async addUser(user, isHost = false) {
    if (isHost) {
      this.hostId = user.id;
    }
    const character = new Character();
    user.attachCharacter(character);
    user.setGameId(this.id);

    this.users.push(user);

    // 핑 인터벌 추가
    IntervalManager.getInstance().addPingInterval(
      user.id,
      () => user.ping(this.socket),
      1000,
      'user',
    );
  }

  async removeUser(userId) {
    const removeUserIndex = this.users.findIndex((user) => user.id === userId);
    this.users.splice(removeUserIndex, 1);

    // 연결을 종료한 사실을 다른 유저들에게 Noti로 알려준다.
    await disconnectPlayerNotification(this, userId);

    IntervalManager.getInstance().removeUserInterval(userId);
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  addGhost(ghost) {
    this.ghosts.push(ghost);
  }

  getGhost(ghostId) {
    return this.ghosts.find((ghost) => ghost.id === ghostId);
  }

  addItem(item) {
    this.items.push(item);
  }

  getItem(itemId) {
    return this.items.find((item) => item.id === itemId);
  }

  removeItem(itemId) {
    const index = this.items.findIndex((item) => item.id === itemId);
    if (index === -1) {
      return -1;
    }
    return this.items.splice(index, 1)[0];
  }

  initDoors() {
    for (let i = 0; i < config.game.max_door_num; i++) {
      const door = new Door(i + 1);
      this.doors.push(door);
    }
  }

  getDoor(doorId) {
    return this.doors.find((door) => door.doorId === doorId);
  }

  // 평균 레이턴시 구하기
  getAvgLatency() {
    const totalLatency = this.users.reduce((total, user) => {
      return total + user.character.latency;
    }, 0);

    const avgLatency = totalLatency / this.users.length;
    return avgLatency;
  }

  async setState(gameState) {
    this.state = gameState;
    await setGameStateRedis(this.id, gameState);
  }

  // 게임 모니터링
  // - 접속 중인 모든 클라이언트의 정보를 일정 시간 마다 출력해준다.
  printGameInfo() {
    if (this.users.length === 0) return;

    console.log(
      `-------------------------------------- [${this.id.substring(
        0,
        8,
      )}] Game Monitor ------------------------------------------`,
    );
    this.users.forEach((user) => {
      // user.printUserInfo()
      // - pos, rot, latency를 출력해준다.
      console.log(
        `[${user.id.substring(0, 8)}] User : ${user.character.printInfo()}`,
      );
    });
    this.ghosts.forEach((ghost, index) => {
      // user.printUserInfo()
      // - pos, rot, latency를 출력해준다.
      console.log(`[${index + 1}}] Ghost : ${ghost.printInfo()}`);
    });
    console.log(
      `---------------------------------------------------------------------------------------------------------`,
    );
  }

  gameTimer() {
    if (this.state !== GAME_SESSION_STATE.INPROGRESS) {
      return;
    }
    this.remainingTime -= 1;

    if (this.remainingTime <= 0) {
      this.stageEnd();
    } else {
      // 게임 남은 시간 동기화를 위해 remainingTimeNotification 패킷을 보낸다.
      remainingTimeNotification(this);
    }
  }

  // 모든 플레이어가 죽었거나 탈출했는지 검사하는 함수
  checkStageEnd() {
    const isEndStage = this.users.every((user) => {
      return (
        user.character.state === CHARACTER_STATE.DIED ||
        user.character.state === CHARACTER_STATE.EXIT
      );
    });

    return isEndStage;
  }

  // 게임 종료 로직
  async stageEnd() {
    // 게임 상태를 END로 변경한다.
    // this.state = GAME_SESSION_STATE.END;
    await this.setState(GAME_SESSION_STATE.END);

    // TODO : 추후 필요한 로직들은 밑에 추가해준다.
    // ex) 아이템 정리, 귀신 정리, 인벤토리 정리 등등...

    // 점수(영혼 모은 개수)를 우선 여기서 구현할까?

    stageEndNotification(this);

    // ** 임시 게임 종료 시, 게임 세션을 삭제하도록 진행
    // 1. 해당 게임 세션에 속한 유저들의 인터벌 삭제
    // 2. 해당 게임 세션에서 수행하는 인터벌 삭제
    // 3. 불큐 삭제
    // 4. destroy this
    this.users.forEach((user) => {
      IntervalManager.getInstance().removeUserInterval(user.id);
    });
    IntervalManager.getInstance().removeGameInterval(this.id);
    await this.doorQueue.queue.obliterate({ force: true });
    await this.doorQueue.queue.close();
    await this.itemQueue.queue.obliterate({ force: true });
    await this.itemQueue.queue.close();
  }
}

export default Game;
