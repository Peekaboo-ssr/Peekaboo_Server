import { getUserByClientKey } from '../../sessions/user.sessions.js';
import { setUserRedis } from '../../redis/user.redis.js';

export const exitDedicatedHandler = async (server, payload) => {
  const { clientKey } = payload;

  const user = getUserByClientKey(server.game.users, clientKey);

  if (!user) {
    console.error(`해당 게임에 없는 유저입니다!`);
    return;
  }

  server.game.removeUser(user.id);
  // 레디스에 유저 정보 저장
  await setUserRedis(user.id, user.gameId);
};
