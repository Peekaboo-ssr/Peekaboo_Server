import handleError from '@peekaboo-ssr/error/handleError';
import { findGameByDedicateKey } from '../../sessions/game.session.js';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

export const deleteDedicatedHandler = (server, payload) => {
  const { dedicateKey } = payload;
  try {
    const key = findGameByDedicateKey(server.gameSessions, dedicateKey);
    if (!key) {
      throw new CustomError(errorCodesMap.GAME_NOT_FOUND);
    }

    // 게임 삭제
    delete server.gameSessions[key];
    console.log('게임이 정상 삭제되었습니다');
  } catch (e) {
    handleError(e);
  }
};
