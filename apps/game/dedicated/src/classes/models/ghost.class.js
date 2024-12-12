import { GHOST_TYPE_ID } from '../../constants/ghost.js';
import { Position, Rotation } from './moveInfo.class.js';

class Ghost {
  constructor(id, ghostTypeId, position, state = 0) {
    this.id = id;
    this.ghostTypeId = ghostTypeId;
    this.position = new Position(position.x, position.y, position.z);
    //this.rotation = new Rotation(rotation.x, rotation.y, rotation.z);
    this.state = state;
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
  attack(user) {
    switch (this.ghostTypeId) {
      case GHOST_TYPE_ID.SMILING_GENTLE_MAN:
        {
          user.character.life--;
        }
        break;
      case GHOST_TYPE_ID.MASSAGER:
        {
        }
        break;
      case GHOST_TYPE_ID.NAUGHTY_BOY:
        {
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
