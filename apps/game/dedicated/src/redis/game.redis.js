import redisManager from '../classes/managers/redisManager.js';
import { config } from '../config/config.js';

/**
 * 방 생성시 redis에 게임 세션의 정보를 저장하는 함수입니다.
 * @param {*} gameId
 * @param {*} inviteCode
 * @param {*} state
 */
export const setGameRedis = async (gameId, inviteCode, state) => {
  const key = `${config.redis.game_set}:${gameId}`;

  const data = { inviteCode, state };

  await redisManager.getClient().hset(key, data);
};

/**
 * redis에 저장된 게임의 상태를 변경하기 위한 함수입니다.
 * @param {*} gameId
 * @param {*} state
 */
export const setGameStateRedis = async (gameId, state) => {
  const key = `${config.redis.game_set}:${gameId}`;

  await redisManager.getClient().hset(key, 'state', state);
};

/**
 * redis에 게임 세션의 정보를 조회하는 함수 입니다.
 * @param {*} gameId
 * @param {*} fieldName 이 매개변수를 입력하면 원하는 속성을 조회할 수 있습니다.
 * @returns
 */
export const getGameRedis = async (gameId, fieldName = null) => {
  const key = `${config.redis.game_set}:${gameId}`;

  let data;
  switch (fieldName) {
    case 'inviteCode':
      {
        data = await redisManager.getClient().hget(key, 'inviteCode');
      }
      break;
    case 'state':
      {
        data = await redisManager.getClient().hget(key, 'state');
      }
      break;
    default: {
      const redisData = await redisManager.getClient().hgetall(key);
      data = {
        gameId: redisData.gameId,
        inviteCode: redisData.inviteCode,
        state: redisData.state,
      };
    }
  }
  return data;
};

/**
 * 게임 종료시 redis에 게임 세션의 정보를 삭제하는 함수 입니다.
 * @param {*} gameId
 */
export const removeGameRedis = async (gameId) => {
  const key = `${config.redis.game_set}:${gameId}`;

  await redisManager.getClient().del(key);
};
