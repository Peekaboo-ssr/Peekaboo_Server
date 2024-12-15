import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { handleError } from '../../../Error/error.handler.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

export const doorToggleRequestHandler = async ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { doorId, doorState } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    // 문 상호작용 요청을 DoorQueue에 추가
    server.game.doorQueue.queue.add(
      { doorId, doorState },
      { jobId: `door:${doorId}`, removeOnComplete: true },
    );
  } catch (e) {
    handleError(e);
  }
};
