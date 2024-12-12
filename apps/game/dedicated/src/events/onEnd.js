import { setUserRedis } from '../redis/user.redis.js';
import { getGameSessionById } from '../sessions/game.session.js';
import { getUserById, removeUser } from '../sessions/user.sessions.js';

export const onEnd = (socket) => async (data) => {
  const user = getUserById(socket.userId);
  //console.log('onEnd socket Log---------------------');
  //console.log(socket);
  const gameSession = getGameSessionById(user.gameId);
  console.log(`${socket.remoteAddress}:${socket.remotePort} User Disconnected`);

  // gameSession에서 user를 제외시킨다.
  await gameSession.removeUser(user.id);

  // userSession에서 user를 제외시킨다.
  removeUser(socket);

  // 레디스에 유저 정보 저장
  await setUserRedis(user.id, user.gameId);
};
