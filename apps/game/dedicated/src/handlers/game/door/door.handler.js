import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

export const doorToggleRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { doorId, doorState } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    // 문 상호작용 요청을 단일 Queue에 추가
    server.game.gameQueue.queue.add(
      { type: 'door', data: { doorId, doorState } }, // 작업 유형(type)을 'door'로 지정
      { jobId: `door:${doorId}`, removeOnComplete: true },
    );
  } catch (e) {
    handleError(e);
  }
};
