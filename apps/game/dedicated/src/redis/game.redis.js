import redisManager from '../classes/managers/redis.manager.js';
import config from '@peekaboo-ssr/config/game';

/**
 * 방 생성 시 Redis에 게임 세션 정보를 저장하는 함수입니다.
 * @param {string} gameId - 게임 ID
 * @param {string} inviteCode - 초대 코드
 * @param {string} state - 게임 상태
 */
export const setGameRedis = async (gameId, inviteCode, state) => {
  const key = `${config.redis.game_set}:${gameId}`;

  const data = { inviteCode, state };

  try {
    const client = redisManager.getClient();
    await client.hset(key, data);
  } catch (error) {
    console.error(`Failed to set game Redis data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Redis에 저장된 게임 상태를 변경하기 위한 함수입니다.
 * @param {string} gameId - 게임 ID
 * @param {string} state - 새로운 게임 상태
 */
export const setGameStateRedis = async (gameId, state) => {
  const key = `${config.redis.game_set}:${gameId}`;

  try {
    const client = redisManager.getClient();
    await client.hset(key, 'state', state);
  } catch (error) {
    console.error(`Failed to set game state Redis data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Redis에서 게임 세션 정보를 조회하는 함수입니다.
 * @param {string} gameId - 게임 ID
 * @param {string|null} [fieldName=null] - 조회할 필드명 (optional)
 * @returns {Promise<Object|string|null>} - 조회된 데이터
 */
export const getGameRedis = async (gameId, fieldName = null) => {
  const key = `${config.redis.game_set}:${gameId}`;

  try {
    const client = redisManager.getClient();
    if (fieldName) {
      return await client.hget(key, fieldName);
    }

    const redisData = await client.hgetall(key);
    return {
      gameId,
      inviteCode: redisData.inviteCode,
      state: redisData.state,
    };
  } catch (error) {
    console.error(`Failed to get game Redis data for key ${key}:`, error);
    throw error;
  }
};

/**
 * 게임 종료 시 Redis에서 게임 세션 정보를 삭제하는 함수입니다.
 * @param {string} gameId - 게임 ID
 */
export const removeGameRedis = async (gameId) => {
  const key = `${config.redis.game_set}:${gameId}`;

  try {
    const client = redisManager.getClient();
    await client.del(key);
  } catch (error) {
    console.error(`Failed to remove game Redis data for key ${key}:`, error);
    throw error;
  }
};
