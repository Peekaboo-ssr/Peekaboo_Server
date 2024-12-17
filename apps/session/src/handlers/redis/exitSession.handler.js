import handleError from '@peekaboo-ssr/error/handleError';
import { exitUserFromSession } from '../../sessions/user.sessions.js';

export const exitSessionHandler = async (serverInstance, data) => {
  try {
    exitUserFromSession(serverInstance.userSessions, data.clientKey);
  } catch (e) {
    handleError(e);
  }
};
