import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

// 호스트 유저만 요청을 보내고 실제로 귀신이 유저의 샤우팅에 의해 떼어졌을떄 요청이 들어옵니다.
export const ghostAttackedRequestHandler = (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { userId, ghostId } = payload;

    // user 검증
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    // 게임 세션에 포함된 ghost찾기
    const ghost = server.game.getGhost(ghostId);
    if (!ghost) {
      throw new CustomError(errorCodesMap.GHOST_NOT_FOUND);
    }

    // 추후 귀신의 피격이 생긴다면 추가 로직 구현 TODO
    // ghostStateChangeNotification(server.game, ghostId, CHARACTER_STATE.ATTACKED)
  } catch (e) {
    handleError(e);
  }
};
