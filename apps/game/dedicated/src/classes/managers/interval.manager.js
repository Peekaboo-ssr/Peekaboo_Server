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

  // 게임 플레이어들 전용 Interval
  addPlayersInterval(gameId, callback, interval, type = 'users') {
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

  addGameTimerInterval(gameId, callback, interval, type = 'timer') {
    if (!this.intervals.has(gameId)) this.intervals.set(gameId, new Map());

    this.intervals.get(gameId).set(type, setInterval(callback, interval));
  }

  removeUserInterval(userId) {
    if (this.intervals.has(userId)) {
      const userIntervals = this.intervals.get(userId);
      userIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      this.intervals.delete(userId);
    }
  }

  removeGameInterval(gameId) {
    if (this.intervals.has(gameId)) {
      const gameIntervals = this.intervals.get(gameId);
      gameIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      this.intervals.delete(gameId);
    }
  }

  removeMonsterTypeInterval(gameId) {
    if (this.intervals.has(gameId)) {
      const gameMonitorInterval = this.intervals.get(gameId);
      clearInterval(gameMonitorInterval.get('monsterType'));
      this.intervals.delete(gameId);
    }
  }

  removeInterval(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  clearAll() {
    this.intervals.forEach((userIntervals) => {
      userIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
    });

    this.intervals.clear();
  }
}

export default IntervalManager;
