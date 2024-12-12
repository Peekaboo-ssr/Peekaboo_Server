import { Rotation, Position } from './moveInfo.class.js';
import { CHARACTER_STATE } from '../../constants/state.js';
import { Inventory } from './inventory.class.js';

export class Character {
  constructor() {
    // 게임 정보
    this.position = new Position(5.07, 0.68, 0.11);
    this.lastPosition = new Position(5.07, 0.68, 0.11);
    this.rotation = new Rotation();
    this.lastRotation = new Rotation();
    this.maxLife = 3;
    this.life = 3;
    this.state = CHARACTER_STATE.IDLE;
    this.speed = 1;
    this.latency = null;
    this.lastUpdateTime = Date.now();
    this.inventory = new Inventory();
  }

  getLastPosition() {
    return this.lastPosition;
  }

  getInventory() {
    return this.inventory;
  }

  printInfo() {
    return `Pos: (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)}) | Rot: (${this.rotation.x.toFixed(2)}, ${this.rotation.y.toFixed(2)}, ${this.rotation.z.toFixed(2)}) | latency: ${this.latency}`;
  }
}
