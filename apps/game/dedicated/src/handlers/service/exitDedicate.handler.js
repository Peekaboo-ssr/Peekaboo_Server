import { getUserByClientKey } from '../../sessions/user.sessions.js';
import IntervalManager from '../../classes/managers/interval.manager.js';

export const exitDedicatedHandler = (server, payload) => {
  const { clientKey } = payload;

  const user = getUserByClientKey(server.game.users, clientKey);

  if (!user) {
    console.error(`해당 게임에 없는 유저입니다!`);
    return;
  }

  // 유저의 모든 인터벌 제거
  IntervalManager.getInstance().removeUserInterval(user.id);

  server.game.users = server.game.users.filter(
    (user) => user.clientKey !== clientKey,
  );
};
