import { removeUser, getUserBySocket } from '../sessions/user.sessions.js';
import { getGameSessionById } from '../sessions/game.session.js';
import { setUserRedis } from '../redis/user.redis.js';

export const onError = (socket) => async (err) => {
  const user = getUserBySocket(socket);
  const gameSession = getGameSessionById(user.gameId);
  console.log(`${socket.remoteAddress}:${socket.remotePort} User Disconnected`);
  console.log(`Socket Error:  ${err.message}`);

  // gameSession에서 user를 제외시킨다.
  await gameSession.removeUser(user.id);

  // userSession에서 user를 제외시킨다.
  removeUser(socket);

  // 레디스에 유저 정보 저장
  await setUserRedis(user.id, user.gameId);
};
