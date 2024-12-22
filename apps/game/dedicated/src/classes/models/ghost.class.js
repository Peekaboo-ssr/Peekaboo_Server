import { GHOST_TYPE_ID } from '../../constants/game.js';
import { Position, Rotation } from './moveInfo.class.js';

class Ghost {
  constructor(id, ghostTypeId, position, state = 0, speed) {
    this.id = id;
    this.ghostTypeId = ghostTypeId;
    this.position = new Position(position.x, position.y, position.z);
    this.rotation = new Rotation(0, 0, 0);
    this.lastPosition = new Position(position.x, position.y, position.z);
    this.lastUpdateTime = Date.now();
    this.state = state;
    this.speed = speed;
  }

  /**
   * 귀신의 상태변경 함수입니다.
   * @param {*} state
   */
  setState(state) {
    this.state = state;
  }

  /**
   * 귀신 타입에 따른 공격 함수입니다.
   * @param {*} user 공격 당할 플레이어(유저)
   */
  async attack(user) {
    switch (this.ghostTypeId) {
      case GHOST_TYPE_ID.SMILING_GENTLE_MAN:
        {
          user.character.life -= 1;
        }
        break;
      case GHOST_TYPE_ID.MASSAGER:
        {
        }
        break;
      case GHOST_TYPE_ID.NAUGHTY_BOY:
        {
          user.character.life -= 1;
        }
        break;
      case GHOST_TYPE_ID.DARK_HAND:
        {
        }
        break;
      case GHOST_TYPE_ID.GRIM_REAPER:
        {
          user.character.life = 0;
        }
        break;
    }
  }

  printInfo() {
    return `Type : ${this.ghostTypeId}, Position : (${this.position.x}, ${this.position.y}, ${this.position.z})`;
  }
}

export default Ghost;
