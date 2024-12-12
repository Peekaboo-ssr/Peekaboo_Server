export const DOOR_STATE = {
  DOOR_LEFT: 1,
  DOOR_MIDDLE: 2,
  DOOR_RIGHT: 3,
};

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
        if (this.status !== DOOR_STATE.DOOR_MIDDLE) {
          return false;
        }
        break;
      case DOOR_STATE.DOOR_MIDDLE:
        if (this.status === DOOR_STATE.DOOR_MIDDLE) {
          return false;
        }
        break;
      case DOOR_STATE.DOOR_RIGHT:
        if (this.status !== DOOR_STATE.DOOR_MIDDLE) {
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
