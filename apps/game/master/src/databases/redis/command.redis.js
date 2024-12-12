import config from '@peekaboo-ssr/config/game';

/**
 * 방 생성시 redis에 게임 세션의 정보를 저장하는 함수입니다.
 * @param {*} gameId
 * @param {*} inviteCode
 * @param {*} state
 */
export const setGameRedis = async (gameId, inviteCode, state, redisManager) => {
  const key = `${config.redisKey.REDIS_GAME_SET_KEY}:${gameId}`;

  const data = { inviteCode, state };

  await redisManager.getClient().hset(key, data);
};

/**
 * redis에 게임 세션의 정보를 조회하는 함수 입니다.
 * @param {*} gameId
 * @param {*} fieldName 이 매개변수를 입력하면 원하는 속성을 조회할 수 있습니다.
 * @returns
 */
export const getGameRedis = async (gameId, fieldName = null, redisManager) => {
  const key = `${config.redisKey.REDIS_GAME_SET_KEY}:${gameId}`;

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
