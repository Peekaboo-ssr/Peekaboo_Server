import BaseManager from './base.manager.js';

class IntervalManager extends BaseManager {
  static instance = null;

  constructor() {
    super();
    this.intervals = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new IntervalManager();
    }
    return this.instance;
  }

  // 플레이어 핑 전용 Interval
  addPingInterval(playerId, callback, interval, type = 'users') {
    if (!this.intervals.has(playerId)) this.intervals.set(playerId, new Map());

    this.intervals.get(playerId).set(type, setInterval(callback, interval));
  }

  addPlayersInterval(gameId, callback, interval, type = 'players') {
    if (!this.intervals.has(gameId)) this.intervals.set(gameId, new Map());

    this.intervals.get(gameId).set(type, setInterval(callback, interval));
  }

  // 게임 귀신들 전용 Interval
  addGhostsInterval(gameId, callback, interval, type = 'ghosts') {
    if (!this.intervals.has(gameId)) this.intervals.set(gameId, new Map());

    this.intervals.get(gameId).set(type, setInterval(callback, interval));
  }

  // 게임 모니터링 전용 Interval
  addGameMonitorInterval(gameId, callback, interval, type = 'monitor') {
    if (!this.intervals.has(gameId)) this.intervals.set(gameId, new Map());

    this.intervals.get(gameId).set(type, setInterval(callback, interval));
  }

  // 게임 타이머 전용 Interval
  addGameTimerInterval(gameId, callback, interval, type = 'timer') {
    if (!this.intervals.has(gameId)) this.intervals.set(gameId, new Map());

    this.intervals.get(gameId).set(type, setInterval(callback, interval));
  }

  addGameRoomInfoInterval(gameId, callback, interval, type = 'room') {
    if (!this.intervals.has(gameId)) this.intervals.set(gameId, new Map());
    this.intervals.get(gameId).set(type, setInterval(callback, interval));
  }

  // 유저 인터벌 삭제
  removeUserInterval(userId) {
    if (this.intervals.has(userId)) {
      const userIntervals = this.intervals.get(userId);
      userIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      this.intervals.delete(userId);
    }
  }

  // 게임 관련 인터벌(귀신, 모니터링, 타이머) 삭제
  removeGameInterval(gameId) {
    if (this.intervals.has(gameId)) {
      const gameIntervals = this.intervals.get(gameId);
      gameIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      this.intervals.delete(gameId);
    }
  }

  // 귀신 인터벌 삭제
  removeGhostsInterval(gameId) {
    if (this.intervals.has(gameId)) {
      const gameIntervals = this.intervals.get(gameId);
      if (gameIntervals.has('ghosts')) {
        const ghostsInterval = this.intervals.get(gameId).get('ghosts');
        clearInterval(ghostsInterval);
        gameIntervals.delete('ghosts');
      }
    }
  }

  // 게임 모니터링 인터벌 삭제
  removeGameMonitorInterval(gameId) {
    if (this.intervals.has(gameId)) {
      const gameIntervals = this.intervals.get(gameId);
      if (gameIntervals.has('monitor')) {
        const ghostsInterval = this.intervals.get(gameId).get('monitor');
        clearInterval(ghostsInterval);
        gameIntervals.delete('monitor');
      }
    }
  }

  // 게임 타이머 인터벌 삭제
  removeGameTimerInterval(gameId) {
    if (this.intervals.has(gameId)) {
      const gameIntervals = this.intervals.get(gameId);
      if (gameIntervals.has('timer')) {
        const ghostsInterval = this.intervals.get(gameId).get('timer');
        clearInterval(ghostsInterval);
        gameIntervals.delete('timer');
      }
    }
  }

  // 모든 인터벌 삭제
  clearAll() {
    this.intervals.forEach((Intervals) => {
      Intervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
    });

    this.intervals.clear();
  }
}

export default IntervalManager;
