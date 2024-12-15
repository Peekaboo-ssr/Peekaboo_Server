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
import { getGameAssets } from '../../init/load.assets.js';
import { setGameStateRedis } from '../../redis/game.redis.js';
import { itemDeleteNotification } from '../../notifications/item/item.notification.js';

class Game {
  constructor(id, inviteCode) {
    this.id = id;
    this.socket = null; // 자체적으로 게이트웨이에 보내기 위한 socket
    this.hostId = null;
    this.isInit = false;

    // 게임 관련 오브젝트를 저장한 배열
    this.users = []; // 플레이어
    this.ghosts = []; // 귀신
    this.items = []; // 아이템
    this.doors = []; // 문

    // 게임 관련 데이터
    this.state = GAME_SESSION_STATE.PREPARE; // 게임 상태 (준비, 플레이, 종료)
    this.inviteCode = inviteCode; // 게임 초대 코드
    this.day = null; // 스테이지 단계
    this.submissionId = null; // 서브미션 단계
    this.difficultyId = null; // 난이도
    this.remainingTime = null; // 스테이지 남은 시간
    this.goalSoulAmount = 0; // 소울 수집 목표량
    this.soulAccumulatedAmount = 0; // 현재 소울량
    this.ghostSpawnPositions = null; // 귀신 스폰 지역
    this.itemSpawnPositions = null; // 아이템(소울) 스폰 지역
    this.gameAssets = getGameAssets(); // 게임 에셋 복제

    // 귀신 관련 데이터
    this.ghostIdCount = 1; // 귀신에 부여할 ID (스폰될떄마다 증가)
    this.ghostCSpawn = false;

    // 아이템 관련 데이터
    this.itemIdCount = 1; // 아이템에 부여할 ID (스폰될때마다 증가)
    this.itemQueue = new ItemQueueManager(this);
    // 문관련 데이터
    this.doorQueue = new DoorQueueManager(this);
    this.doorQueue.initializeQueue(); // Game이 완전히 초기화된 뒤에 큐 초기화

    // 스테이지 초기화
    this.initStage();

    IntervalManager.getInstance().addGameMonitorInterval(
      this.id,
      this.printGameInfo.bind(this),
      3000,
    );
  }

  initStage() {
    // 맨 처음 스테이지를 초기화할 때에는 day와 submissionId를 직접 지정해준다.
    if (!this.isInit) {
      this.day = 1;
      const initSubMissionData = this.gameAssets.submission.data[0];
      this.submissionId = initSubMissionData.Id;
      this.goalSoulAmount = initSubMissionData.SubmissionValue;
      this.soulAccumulatedAmount = 1000;
    }

    // 귀신 스폰 가능 지점 초기화 => 원본 데이터 유지를 위한 복제
    this.ghostSpawnPositions = [...this.gameAssets.ghostSpawnPos.data];
    this.itemSpawnPositions = [...this.gameAssets.soulItemPos.data];

    // 문, 아이템, 귀신 초기화
    this.initDoors();
    this.initItems();
    this.initGhosts();

    // 다음 스테이지 검사
    this.day += 1;
    if (this.day > config.game.submission_duration) {
      // 만약 영혼 할당치를 못모았다면?
      // 1) 게임 종료 후 => 메인화면
      // 2) submission "A"로 초기화
      // 3) 현재 submission "~"로 초기화
      if (this.goalSoulAmount > this.soulAccumulatedAmount) {
        //
      } else {
        // 영혼 할당치를 모두 모았다면
        this.day -= config.game.submission_duration;
        const nextSubMissionData = gameAssets.submission.data.find(
          (submission) => submission.Id === this.submissionId + 1,
        );
        if (!nextSubMissionData) {
          console.log(`다음 서브미션이 존재하지 않습니다.`);
        }
        // 영혼 수집량을 0으로 초기화 or goalSoulAmount만큼 빼주기
        // this.soulAccumulatedAmount = 0;
        this.soulAccumulatedAmount -= this.goalSoulAmount;

        this.submissionId = nextSubMissionData.Id;
        this.goalSoulAmount = nextSubMissionData.SubmissionValue;
      }
    }
    // 게임 상태를 준비상태로 변경
    this.state = GAME_SESSION_STATE.PREPARE;
  }

  // stage 시작
  async startStage() {
    // 게임 상태 변경
    await this.setState(GAME_SESSION_STATE.INPROGRESS);

    // 게임 남은 시간 초기화
    this.remainingTime = this.gameAssets.difficulty.data.find(
      (data) => data.id === this.difficultyId,
    )[`TimeLimit(sec)`];

    IntervalManager.getInstance().addGhostsInterval(
      this.id,
      () => ghostsLocationNotification(this),
      100,
    );

    IntervalManager.getInstance().addGameTimerInterval(
      this.id,
      this.gameTimer.bind(this),
      1000,
    );
  }

  // 스테이지 종료 로직
  async endStage() {
    // 게임 상태를 END로 변경한다.
    // this.state = GAME_SESSION_STATE.END;
    this.state = GAME_SESSION_STATE.PREPARE;

    // 먼저 스테이지가 종료되었다는 stageEndNotification을 보내준다.
    stageEndNotification(this);

    await this.setState(GAME_SESSION_STATE.PREPARE);

    // 귀신 및 게임 타이머 인터벌 삭제
    IntervalManager.getInstance().removeGhostsInterval(this.id);
    IntervalManager.getInstance().removeGameTimerInterval(this.id);

    // TODO : 추후 필요한 로직들은 밑에 추가해준다.
    // ex) 아이템 정리, 귀신 정리, 인벤토리 정리 등등...

    // 점수(영혼 모은 개수)를 우선 여기서 구현할까?

    // ** 임시 게임 종료 시, 게임 세션을 삭제하도록 진행
    // 1. 해당 게임 세션에 속한 유저들의 인터벌 삭제
    // 2. 해당 게임 세션에서 수행하는 인터벌 삭제
    // 3. 불큐 삭제
    // 4. destroy this
    // this.users.forEach((user) => {
    //   IntervalManager.getInstance().removeUserInterval(user.id);
    // });
    // IntervalManager.getInstance().removeGameInterval(this.id);
    // await this.doorQueue.queue.obliterate({ force: true });
    // await this.doorQueue.queue.close();
    // await this.itemQueue.queue.obliterate({ force: true });
    // await this.itemQueue.queue.close();
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

    // 연결을 종료한 사실을 다른 유저들에게 disconnectPlayerNotification로 알려준다.
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

  initItems() {
    if (this.items.length === 0) return;

    // 클라이언트에게 인벤토리에 포함되지 아이템들을 삭제하라고 알려주기 위해
    // ItemDeleteNotification을 보내준다.
    const deleteItems = this.items
      .filter((item) => item.mapOn === true)
      .map((item) => item.id);
    itemDeleteNotification(this, deleteItems);

    const deleteGhosts = this.ghosts.map((ghost) => ghost.id);
    ghostDeleteNotification(this, deleteGhosts);

    // 인벤토리에 들어간 아이템이 아닌 맵에 존재하는 아이템들을 삭제한다.
    this.items = this.items.filter((item) => item.mapOn === false);
  }

  initGhosts() {
    this.ghosts = [];
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
    if (this.users.length === 0 && this.ghosts.length === 0) return;

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
      this.endStage();
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

  static getGameInstance() {
    return this;
  }
}

export default Game;
