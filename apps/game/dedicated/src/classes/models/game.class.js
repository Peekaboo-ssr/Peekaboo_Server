import IntervalManager from '../managers/interval.manager.js';
import { GAME_SESSION_STATE } from '../../constants/state.js';
import { Character } from './character.class.js';
import {
  ghostDeleteNotification,
  ghostsLocationNotification,
  ghostSpawnNotification,
} from '../../notifications/ghost/ghost.notification.js';
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
import { getRandomInt } from '../../utils/math/getRandomInt.js';
import Item from './item.class.js';
import { Position } from './moveInfo.class.js';
import Ghost from './ghost.class.js';

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
    this.defaultRemainingTime = null; // 스테이지 제한 시간
    this.remainingTime = null; // 스테이지 남은 시간
    this.goalSoulCredit = null; // 소울 수집 목표량
    this.soulCredit = null; // 현재 소울량
    this.ghostSpawnPositions = null; // 귀신 스폰 지역
    this.itemSpawnPositions = null; // 소울 아이템 스폰 지역
    this.spawnGhost = null; // 스폰 가능한 귀신
    this.defaultRemainingTime = null; // 제한 시간
    this.minGhostNumber = null; // 귀신 최소 스폰수
    this.maxGhostNumber = null; // 귀신 최대 스폰수
    this.minSoulItemNumber = null; // 소울 아이템 최소 스폰수
    this.maxSoulItemNumber = null; // 소울 아이템 최대 스폰수
    this.gameAssets = getGameAssets(); // 게임 에셋 복제

    // 귀신 관련 데이터
    this.ghostIdCount = 1; // 귀신에 부여할 ID (스폰될떄마다 증가)
    this.ghostCSpawn = false;

    // 아이템 관련 데이터
    this.itemIdCount = 1; // 아이템에 부여할 ID (스폰될때마다 증가)
    this.itemQueue = new ItemQueueManager(this);
    this.itemQueue.initializeItemQueue();

    // 문관련 데이터
    this.doorQueue = new DoorQueueManager(this);
    this.doorQueue.initializeDoorQueue(); // Game이 완전히 초기화된 뒤에 큐 초기화

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
      this.day = config.game.submission_duration;
      const initSubMissionData = this.gameAssets.submission.data[0];
      this.submissionId = initSubMissionData.Id;
      this.goalSoulAmount = initSubMissionData.SubmissionValue;
      this.soulAccumulatedAmount = 1000;
    }

    // 귀신 스폰 가능 지점 초기화 => 원본 데이터 유지를 위한 복제
    // this.ghostSpawnPositions = [...this.gameAssets.ghostSpawnPos.data];
    // this.itemSpawnPositions = [...this.gameAssets.soulItemPos.data];

    // 문, 아이템, 귀신 초기화
    this.initDoors();
    this.initItems();
    // this.initGhosts();

    // 게임 상태를 준비상태로 변경
    this.state = GAME_SESSION_STATE.PREPARE;
  }

  // stage 시작
  async startStage() {
    // 게임 상태 변경
    await this.setState(GAME_SESSION_STATE.INPROGRESS);

    // 게임 남은 시간 초기화
    this.remainingTime = this.defaultRemainingTime;

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
    await this.setState(GAME_SESSION_STATE.END);
    // 먼저 스테이지가 종료되었다는 stageEndNotification을 보내준다.
    this.day -= 1;
    stageEndNotification(this);

    // 귀신 및 게임 타이머 인터벌 삭제
    IntervalManager.getInstance().removeGhostsInterval(this.id);
    IntervalManager.getInstance().removeGameTimerInterval(this.id);

    this.initStage();
  }

  async addUser(user, isHost = false) {
    if (this.users.length >= config.game.max_player) {
      return false;
    }

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

    return true;
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

  setDifficulty(difficultyId) {
    this.difficultyId = difficultyId + 100;
    console.log(`difficultyId : ${difficultyId}`);

    const difficultyData = this.gameAssets.difficulty.data.find(
      (data) => data.Id === this.difficultyId,
    );
    if (!difficultyData) {
      console.error(`Not exist difficulty data`);
    }

    this.spawnGhost = difficultyData.SpawnGhost;
    this.defaultRemainingTime = difficultyData.TimeLimit;
    this.minGhostNumber = difficultyData.MinGhostNumber;
    this.maxGhostNumber = difficultyData.MaxGhostNumber;
    this.minSoulItemNumber = difficultyData.MinSoulItemNumber;
    this.maxSoulItemNumber = difficultyData.MaxSoulItemNumber;

    this.spawnSoulItem = this.gameAssets.item.data
      .filter((data) => data.Extraction === 'TRUE')
      .map((data) => data.Id);
    this.itemSpawnPositions = this.gameAssets.soulItemPos.data.map((data) => {
      const [x, y, z] = data.POS.split(',').map(Number);
      return new Position(x, y, z);
    });
    this.ghostSpawnPositions = this.gameAssets.ghostSpawnPos.data.map(
      (data) => {
        const [x, y, z] = data.GhostSpawnPos.split(',').map(Number);
        return new Position(x, y, z);
      },
    );
    console.log(`itemSpawnPositions : ${this.itemSpawnPositions}`);
    console.log(`ghostSpawnPositions : ${this.ghostSpawnPositions}`);
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

    // 인벤토리에 들어간 아이템이 아닌 맵에 존재하는 아이템들을 삭제한다.
    this.items = this.items.filter((item) => item.mapOn === false);
  }

  initGhosts() {
    if (this.ghosts.length === 0) return;
    const deleteGhosts = this.ghosts.map((ghost) => ghost.id);
    ghostDeleteNotification(this, deleteGhosts);
    this.ghosts = [];
  }

  spawnItems() {
    const spawnSoulItemNumber = getRandomInt(
      this.minSoulItemNumber,
      this.maxSoulItemNumber + 1,
    );
    const copyItemSpawnPosition = [...this.itemSpawnPositions];
    for (let i = 0; i < spawnSoulItemNumber; i++) {
      const itemId = this.getUniqueItemId();
      const itemTypeId =
        this.spawnSoulItem[getRandomInt(0, this.spawnSoulItem.length)];
      const randomPosIdx = getRandomInt(0, copyItemSpawnPosition.length);
      const itemPosition = copyItemSpawnPosition[randomPosIdx];
      copyItemSpawnPosition.splice(randomPosIdx, 1);
      this.items.push(new Item(itemId, itemTypeId, itemPosition));
    }
  }

  spawnGhosts() {
    const spawnGhostNumber = getRandomInt(
      this.minGhostNumber,
      this.maxGhostNumber + 1,
    );
    const copyGhostSpawnPositions = [...this.ghostSpawnPositions];
    const copyGhostTypes = [...this.spawnGhost];
    for (let i = 0; i < spawnGhostNumber; i++) {
      const ghostId = this.getUniqueGhostId();
      const randomTypeIdx = getRandomInt(0, this.copyGhostTypes.length);
      const ghostTypeId = copyGhostTypes[randomTypeIdx];
      if (copyGhostTypes.length !== 1) {
        copyGhostTypes.splice(randomTypeIdx, 1);
      }
      const randomPosIdx = getRandomInt(0, copyGhostSpawnPositions.length);
      const ghostPosition = copyGhostSpawnPositions[randomPosIdx];
      copyGhostSpawnPositions.splice(randomPosIdx, 1);
      this.ghosts.push(new Ghost(ghostId, ghostTypeId, ghostPosition));

      const ghostInfo = {
        ghostId,
        ghostTypeId,
        moveInfo: ghostPosition.getPosition(),
      };

      //ghostSpawnNotification(this, ghostInfo);
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
  // checkStageEnd() {
  //   const isEndStage = this.users.every((user) => {
  //     return (
  //       user.character.state === CHARACTER_STATE.DIED ||
  //       user.character.state === CHARACTER_STATE.EXIT
  //     );
  //   });

  //   return isEndStage;
  // }

  endSubmission() {
    // submission 목표치 검증
    const gameAssets = getGameAssets();
    if (this.soulCredit >= this.goalSoulCredit) {
      // 목표치를 모았다면 성공
      this.day += SUBMISSION_DURATION;
      const nextSubMissionData = gameAssets.submission.data.find(
        (submission) => submission.Id === this.submissionId + 1,
      );
      if (!nextSubMissionData) {
        console.log(`다음 서브미션이 존재하지 않습니다.`);
      }
      // 영혼 수집량을 0으로 초기화 or goalSoulAmount만큼 빼주기
      this.soulCredit -= this.goalSoulCredit;
      this.submissionId = nextSubMissionData.Id;
      this.goalSoulCredit = nextSubMissionData.SubmissionValue;

      return true;
    } else {
      // 목표치를 모으지 못했다면 실패
      // 1. 현재 submission => Day 2 부터 시작할지
      // 2. 첫 submission => Day 2 부터 시작할지
      // 실패시, 특별히 처리할 로직이 없다...
      return false;
    }
  }
}

export default Game;
