import User from '../classes/models/user.class.js';
import { userSessions } from './sessions.js';

export const getUserByClientKey = (users, clientKey) => {
  return users.find((user) => user.clientKey === clientKey);
};

// ---------------------------------------- 이 아래는 삭제할 것.

export const addUser = (id, socket) => {
  const user = new User(id, socket);
  userSessions.push(user);
  return user;
};

export const removeUser = (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);
  if (index !== -1) {
    return userSessions.splice(index, 1)[0];
  }
};

export const getUserById = (id) => {
  return userSessions.find((user) => user.id === id);
};

export const getUserBySocket = (socket) => {
  return userSessions.find((user) => user.socket === socket);
};
