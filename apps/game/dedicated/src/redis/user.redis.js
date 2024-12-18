import redisManager from '../classes/managers/redis.manager.js';
import config from '@peekaboo-ssr/config/game';

/**
 * 해당 유저의 정보를 Redis에 저장하는 함수입니다.
 * @param {string} userId - 유저 ID
 * @param {string} gameId - 게임 ID
 */
export const setUserRedis = async (userId, gameId) => {
  const key = `${config.redis.user_set}:${userId}`;

  const data = { gameId };

  try {
    const client = redisManager.getClient();
    await client.hset(key, data);
    await client.expire(key, 640); // 유효 시간 10분 40초
  } catch (error) {
    console.error(`Failed to set user Redis data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Redis에 저장한 해당 유저 정보를 반환하는 함수입니다.
 * @param {string} userId - 유저 ID
 * @returns {Promise<Object>} - 유저 정보
 */
export const getUserRedis = async (userId) => {
  const key = `${config.redis.user_set}:${userId}`;

  try {
    const client = redisManager.getClient();
    const redisData = await client.hgetall(key);

    return {
      gameId: redisData.gameId,
    };
  } catch (error) {
    console.error(`Failed to get user Redis data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Redis에 저장한 해당 유저 정보를 삭제하는 함수입니다.
 * @param {string} userId - 유저 ID
 */
export const removeUserRedis = async (userId) => {
  const key = `${config.redis.user_set}:${userId}`;

  try {
    const client = redisManager.getClient();
    await client.del(key);
  } catch (error) {
    console.error(`Failed to remove user Redis data for key ${key}:`, error);
    throw error;
  }
};
