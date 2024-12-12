import { exitUserFromSession } from '../../sessions/user.sessions.js';

export const exitSessionHandler = async (serverInstance, data) => {
  try {
    exitUserFromSession(data.clientKey);
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};
