import { DOOR_STATE } from '../../constants/state.js';

export class Door {
  constructor(doorId) {
    this.doorId = doorId;
    this.status = DOOR_STATE.DOOR_MIDDLE;
  }

  getStatus() {
    return this.status;
  }

  checkDoorInteraction(inputDoorState) {
    switch (inputDoorState) {
      case DOOR_STATE.DOOR_LEFT:
        if (this.status === DOOR_STATE.DOOR_LEFT) {
          return false;
        }
        break;
      case DOOR_STATE.DOOR_MIDDLE:
        if (this.status === DOOR_STATE.DOOR_MIDDLE) {
          return false;
        }
        break;
      case DOOR_STATE.DOOR_RIGHT:
        if (this.status === DOOR_STATE.DOOR_RIGHT) {
          return false;
        }
        break;
    }

    return true;
  }

  setStatus(doorState) {
    this.status = doorState;
  }

  setDoorLeft() {
    this.status = DOOR_STATE.DOOR_LEFT;
  }

  setDoorMiddle() {
    this.status = DOOR_STATE.DOOR_MIDDLE;
  }

  setDoorRight() {
    this.status = DOOR_STATE.DOOR_RIGHT;
  }
}
