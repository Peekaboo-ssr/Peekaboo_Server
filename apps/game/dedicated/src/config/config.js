import {
  DISTRIBUTOR_PORT,
  EC1_HOST,
  GATEWAY_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} from '../constants/env.js';
import { HEADERS } from '../constants/header.js';
import { PACKET_TYPE } from '../constants/packet.js';
import {
  MAX_PLAYER,
  MAX_PLAYER_HP,
  MAX_GHOST_NUM,
  INVITE_CODE_LENGTH,
  MAX_DOOR_NUM,
} from '../constants/game.js';
import { REDIS_GAME_SET_KEY, REDIS_USER_SET_KEY } from '../constants/redis.js';

export const config = {
  server: {
    game: {
      host: EC1_HOST,
    },
    distributor: {
      host: EC1_HOST,
      port: DISTRIBUTOR_PORT,
    },
    gateway: {
      host: EC1_HOST,
      port: GATEWAY_PORT,
    },
  },
  ...HEADERS,
  ...PACKET_TYPE,
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    user_set: REDIS_USER_SET_KEY,
    game_set: REDIS_GAME_SET_KEY,
  },
  game: {
    max_player: MAX_PLAYER,
    max_player_hp: MAX_PLAYER_HP,
    max_ghost_num: MAX_GHOST_NUM,
    invite_code_length: INVITE_CODE_LENGTH,
    max_door_num: MAX_DOOR_NUM,
  },
};
