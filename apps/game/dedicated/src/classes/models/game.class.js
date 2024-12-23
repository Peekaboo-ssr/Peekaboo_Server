// asset
import { getGameAssets } from '../../load.assets.js';
// managers
import IntervalManager from '../managers/interval.manager.js';
import GameQueueManager from '../managers/gameQueue.manager.js';
// class
import Item from './item.class.js';
import Ghost from './ghost.class.js';
import { Position } from './moveInfo.class.js';
import { Character } from './character.class.js';
import { Door } from './door.class.js';
// notification
import {
  ghostDeleteNotification,
  ghostsLocationNotification,
} from '../../notifications/ghost/ghost.notification.js';
import { usersLocationNotification } from '../../notifications/player/player.notification.js';
import {
  remainingTimeNotification,
  stageEndNotification,
} from '../../notifications/system/system.notification.js';
import { itemDeleteNotification } from '../../notifications/item/item.notification.js';
import { extractSoulNotification } from '../../notifications/extractor/extractor.notification.js';
// utils
import { setGameStateRedis } from '../../redis/game.redis.js';
import { getRandomInt } from '../../utils/math/getRandomInt.js';
import { removeGameRedis } from '../../redis/game.redis.js';
// config
import config from '@peekaboo-ssr/config/game';
import { DOOR_STATE } from '../../constants/state.js';
import {
  SUBMISSION_DURATION,
  MAX_PLAYER,
  MAX_DOOR_NUM,
} from '../../constants/game.js';
import { CHARACTER_STATE } from '../../constants/state.js';
import { lifeResponse } from '../../response/player/life.response.js';

class Game {
  constructor(id, inviteCode) {
    this.id = id;
    this.socket = null; // 자체적으로 게이트웨이에 보내기 위한 socket
    this.hostId = null;
    this.isCreated = false;
    this.isInit = false;

    // 게임 관련 오브젝트를 저장한 배열
    this.users = []; // 플레이어
    this.ghosts = []; // 귀신
    this.items = []; // 아이템
    this.doors = []; // 문

    // 게임 관련 데이터
    this.state = config.clientState.gameState.PREPARE; // 게임 상태 (준비, 플레이, 종료)
    this.inviteCode = inviteCode; // 게임 초대 코드
    this.day = null; // 스테이지 단계
    this.submissionDay = null; // 서브미션 데이
    this.submissionId = null; // 서브미션 단계
    this.difficultyId = null; // 난이도
    this.remainingTime = null; // 스테이지 남은 시간
    this.defaultRemainingTime = null; // 제한 시간
    this.isRemainingTimeOver = false; // 제한 시간 경과로 인한 게임 오버
    this.gameAssets = getGameAssets(); // 게임 에셋 복제

    // 소울 관련 데이터
    this.goalSoulCredit = null; // 소울 수집 목표량
    this.soulCredit = null; // 현재 소울량
    this.itemSpawnPositions = null; // 소울 아이템 스폰 지역
    this.minSoulItemNumber = null; // 소울 아이템 최소 스폰수
    this.maxSoulItemNumber = null; // 소울 아이템 최대 스폰수

    // 귀신 관련 데이터
    this.ghostSpawnPositions = null; // 귀신 스폰 지역
    this.spawnGhost = null; // 스폰 가능한 귀신
    this.minGhostNumber = null; // 귀신 최소 스폰수
    this.maxGhostNumber = null; // 귀신 최대 스폰수
    this.ghostIdCount = 1; // 귀신에 부여할 ID (스폰될떄마다 증가)
    this.ghostCSpawn = false;

    // 아이템 관련 데이터
    this.itemIdCount = 1; // 아이템에 부여할 ID (스폰될때마다 증가)
    this.gameQueue = new GameQueueManager(this);
    this.gameQueue.initializeQueue();

    // 스테이지 초기화
    this.initStage();

    IntervalManager.getInstance().addGameMonitorInterval(
      this.id,
      this.printGameInfo.bind(this),
      3000,
    );

    IntervalManager.getInstance().addPlayersInterval(
      this.id,
      () => usersLocationNotification(this),
      100,
    );
  }

  async initStage() {
    // 서브미션 첫 시작할 때에는 day와 submissionId를 직접 지정해준다.
    if (!this.isInit) {
      this.day = SUBMISSION_DURATION;
      const initSubMissionData = this.gameAssets.submission.data[0];
      this.submissionId = initSubMissionData.Id;
      this.submissionDay = initSubMissionData.Day;
      this.goalSoulCredit = initSubMissionData.SubmissionValue;
      this.soulCredit = 0;
      // 플레이어 생명력도 다 초기로 돌림
      this.users.forEach((user) => {
        const maxHp = user.character.maxLife;
        user.character.life = maxHp;
      });
      this.isInit = true;
    }

    // 문, 아이템, 귀신, 플레이어 초기화
    this.initDoors();
    this.initItems();
    this.initGhosts();
    this.initPlayers();

    // 게임 상태를 준비상태로 변경
    if (this.state !== config.clientState.gameState.PREPARE) {
      this.state = config.clientState.gameState.PREPARE;
    }
    this.isRemainingTimeOver = false;
  }

  // stage 시작
  async startStage() {
    // 게임 상태 변경
    await this.setState(config.clientState.gameState.INPROGRESS);

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
    if (this.state === config.clientState.gameState.INPROGRESS) {
      // 귀신 및 게임 타이머 인터벌 삭제 (이미 전 endStage 삭제됐음) - 에러 발생 가능성 있음
      IntervalManager.getInstance().removeGhostsInterval(this.id);
      IntervalManager.getInstance().removeGameTimerInterval(this.id);

      // 게임 상태를 END로 변경한다.
      await this.setState(config.clientState.gameState.END);

      this.day -= 1;
      await stageEndNotification(this);

      // TODO: 사망한 플레이어만큼 soulCredit 깎기

      if (this.isInit === true) {
        this.isInit === false;
      }
      await this.initStage();
    }
    // 서브미션 실패로 인한 endStage()로 판단
    else if (this.state === config.clientState.gameState.FAIL) {
      // 게임 상태를 END로 변경한다.
      await this.setState(config.clientState.gameState.END);
      await this.initStage();
      await stageEndNotification(this);
    }
    // 스테이지 종료 후 난이도 초기화
    this.difficultyId = null;
  }

  async addUser(user, isHost = false) {
    if (this.users.length >= MAX_PLAYER) {
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
    setTimeout(() => {
      IntervalManager.getInstance().addPingInterval(
        user.id,
        () => user.ping(this.socket),
        1000,
        'user',
      );
    }, 3000);

    return true;
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
    this.difficultyId = difficultyId;

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
    // console.log(`itemSpawnPositions : ${this.itemSpawnPositions}`);
    // console.log(`ghostSpawnPositions : ${this.ghostSpawnPositions}`);
    // console.log(`minSoulItemNumber : ${this.minSoulItemNumber}`);
    // console.log(`maxSoulItemNumber : ${this.maxSoulItemNumber}`);
  }

  initDoors() {
    // 문이 이미 생성된 상태라면 모두 MIDDLE로 초기화
    if (this.doors.length !== 0) {
      for (let i in this.doors) {
        this.doors[i].setStatus(DOOR_STATE.DOOR_MIDDLE);
      }
    } else {
      for (let i = 0; i < MAX_DOOR_NUM; i++) {
        const door = new Door(i + 1);
        this.doors.push(door);
      }
    }
  }

  initItems() {
    if (this.items.length === 0) return;
    if (this.isRemainingTimeOver) {
      // 전부 죽거나, 타임아웃 상태
      const deleteItems = this.items.map((item) => item.id);
      itemDeleteNotification(this, deleteItems);
      // 아이템 빈 배열로 만듦
      this.items = [];
    } else {
      // 클라이언트에게 인벤토리에 포함되지 아이템들을 삭제하라고 알려주기 위해
      // ItemDeleteNotification을 보내준다.
      const deleteItems = this.items
        .filter((item) => item.mapOn === true)
        .map((item) => item.id);
      itemDeleteNotification(this, deleteItems);
      // 인벤토리에 들어간 아이템이 아닌 맵에 존재하는 아이템들을 삭제한다.
      this.items = this.items.filter((item) => item.mapOn === false);
    }
  }

  initGhosts() {
    if (this.ghosts.length === 0) return;
    const deleteGhosts = this.ghosts.map((ghost) => ghost.id);
    ghostDeleteNotification(this, deleteGhosts);
    this.ghosts = [];
  }

  initPlayers() {
    const startPosition = new Position(-13.17, 1, 22.5);
    // 위치 및 상태초기화
    this.users.forEach((user) => {
      user.character.position.updateClassPosition(startPosition);

      if (user.character.life <= 0) {
        user.character.state = CHARACTER_STATE.IDLE;
        user.character.life = 1;
      }
    });
  }

  spawnItems() {
    const spawnSoulItemNumber = getRandomInt(
      this.minSoulItemNumber,
      this.maxSoulItemNumber + 1,
    );
    const copyItemSpawnPosition = [...this.itemSpawnPositions];
    const itemInfos = [];
    for (let i = 0; i < spawnSoulItemNumber; i++) {
      const itemId = this.getUniqueItemId();
      const itemTypeId =
        this.spawnSoulItem[getRandomInt(0, this.spawnSoulItem.length)];
      const randomPosIdx = getRandomInt(0, copyItemSpawnPosition.length);
      const itemPosition = copyItemSpawnPosition[randomPosIdx];
      copyItemSpawnPosition.splice(randomPosIdx, 1);
      this.items.push(new Item(itemId, itemTypeId, itemPosition));

      const itemInfo = {
        itemId,
        itemTypeId,
        position: itemPosition.getPosition(),
      };

      itemInfos.push(itemInfo);
    }

    return itemInfos;
  }

  spawnGhosts() {
    const spawnGhostNumber = getRandomInt(
      this.minGhostNumber,
      this.maxGhostNumber + 1,
    );
    const copyGhostSpawnPositions = [...this.ghostSpawnPositions];
    const copyGhostTypes = [...this.spawnGhost];
    const ghostInfos = [];
    for (let i = 0; i < spawnGhostNumber; i++) {
      const ghostId = this.getUniqueGhostId();
      const randomTypeIdx = getRandomInt(0, copyGhostTypes.length);
      const ghostTypeId = copyGhostTypes[randomTypeIdx];
      if (copyGhostTypes.length !== 1) {
        copyGhostTypes.splice(randomTypeIdx, 1);
      }
      const randomPosIdx = getRandomInt(0, copyGhostSpawnPositions.length);
      const ghostPosition = copyGhostSpawnPositions[randomPosIdx];
      copyGhostSpawnPositions.splice(randomPosIdx, 1);

      const ghostData = this.gameAssets.ghost.data.find((ghost) => {
        return ghost.Id === ghostTypeId;
      });

      const rotation = { x: 0, y: 0, z: 0 };
      const moveInfo = {
        position: ghostPosition.getPosition(),
        rotation,
      };
      const ghostInfo = {
        ghostId,
        ghostTypeId,
        moveInfo,
      };
      this.ghosts.push(
        new Ghost(ghostId, ghostTypeId, ghostPosition, 0, ghostData.Speed),
      );
      ghostInfos.push(ghostInfo);
    }

    return ghostInfos;
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
      console.log(`[${index + 1}] Ghost : ${ghost.printInfo()}`);
    });
    console.log(
      `---------------------------------------------------------------------------------------------------------`,
    );
  }

  gameTimer() {
    if (this.state !== config.clientState.gameState.INPROGRESS) {
      return;
    }
    this.remainingTime -= 1;

    // 게임 남은 시간 동기화를 위해 remainingTimeNotification 패킷을 보낸다.
    remainingTimeNotification(this);

    if (this.remainingTime <= 0) {
      console.log('게임 오버!!!!!!!!!');
      this.users.forEach((user) => {
        user.character.state = CHARACTER_STATE.DIED;
        user.character.life = 0;
        const lifePayload = {
          life: 0,
          isAttacked: false,
        };
        lifeResponse(this.socket, user.clientKey, lifePayload);
      });
      this.isRemainingTimeOver = true;
      this.endStage();
    }
  }

  // 모든 플레이어가 죽었거나 탈출했는지 검사하는 함수
  checkStageEnd() {
    const isEndStage = this.users.every((user) => {
      return user.character.life <= 0;
    });
    return isEndStage;
  }

  async endSubmission() {
    // submission 목표치 검증
    if (this.soulCredit >= this.goalSoulCredit) {
      // 목표치를 모았다면 성공
      this.day += SUBMISSION_DURATION;
      const nextSubMissionData = this.gameAssets.submission.data.find(
        (submission) => submission.Id === this.submissionId + 1,
      );
      if (!nextSubMissionData) {
        console.log(`다음 서브미션이 존재하지 않습니다.`);
      }
      // 영혼 수집량을 0으로 초기화 or goalSoulCredit만큼 빼주기
      this.soulCredit -= this.goalSoulCredit;
      // 영혼 할당량 뺀 다음 Notification 날리기
      extractSoulNotification(this);
      this.submissionId = nextSubMissionData.Id;
      this.submissionDay = nextSubMissionData.Day;
      this.goalSoulCredit = nextSubMissionData.SubmissionValue;
      return true;
    } else {
      this.state = config.clientState.gameState.FAIL;
      // initStage()가 이후에 호출될 때 완전 초기로 세팅
      this.isInit = false;
      return false;
    }
  }

  getUniqueItemId() {
    return this.itemIdCount++;
  }

  getUniqueGhostId() {
    return this.ghostIdCount++;
  }

  async checkRemainUsers(game) {
    if (game.users.length <= 0) {
      IntervalManager.getInstance().clearAll();
      await removeGameRedis(game.id);
      console.log('-------남은 유저가 없어 종료합니다-------');
      process.exit(1);
    }
  }
}

export default Game;
