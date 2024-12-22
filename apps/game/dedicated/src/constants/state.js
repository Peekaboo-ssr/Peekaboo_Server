// 각종 상태에 대한 상수를 정의한 파일
export const CHARACTER_STATE = {
  CHARACTER_STATE_NONE: 0,
  IDLE: 1,
  MOVE: 2,
  RUN: 3,
  JUMP: 4,
  ATTACK: 5,
  DIED: 6,
  ATTACKED: 7,
  COOLDOWN: 8,
  SHOUT: 9,
  EXIT: 10,
};

export const GHOST_SPECIAL_STATE = {
  GHOST_SPECIAL_STATE_NONE: 0,
  SEE: 1,
  EYE_LIGHT: 2,
};

export const DOOR_STATE = {
  DOOR_LEFT: 1,
  DOOR_MIDDLE: 2,
  DOOR_RIGHT: 3,
};
