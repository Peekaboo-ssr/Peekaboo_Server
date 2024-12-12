import Game from '../classes/models/game.class.js';
import { removeGameRedis } from '../redis/game.redis.js';
import { gameSessions } from './sessions.js';

export const addGameSession = (gameId) => {
  const session = new Game(gameId);
  gameSessions.push(session);
  return session;
};

export const removeGameSession = async (gameId) => {
  const index = gameSessions.findIndex((game) => game.id === gameId);
  if (index !== -1) {
    return gameSessions.splice(index, 1)[0];
  }
  await removeGameRedis(gameId);
};

export const getGameSessionById = (id) => {
  return gameSessions.find((game) => game.id === id);
};

export const getGameSessionByInviteCode = (inviteCode) => {
  return gameSessions.find((game) => game.inviteCode === inviteCode);
};
