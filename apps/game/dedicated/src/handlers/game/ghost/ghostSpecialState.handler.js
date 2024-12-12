import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { ghostSpecialStateNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getGameSessionById } from '../../../sessions/game.session.js';
import { getUserById } from '../../../sessions/user.sessions.js';

/**
 * 귀신의 특수 상태 요청에 대한 핸들러 함수입니다. (호스트만 요청)
 */
export const ghostSpecialStateRequestHandler = ({ socket, payload }) => {
  try {
    const { ghostId, specialState, isOn } = payload;
    // user 검증
    const user = getUserById(socket.userId);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    // 게임 세션 검증
    const gameSession = getGameSessionById(user.gameId);
    if (!gameSession) {
      throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
    }

    // 추후 특수 상태에 따른 변화 로직이 있으면 추가 TODO
    // switch(specialState) {

    // }

    ghostSpecialStateNotification(gameSession, payload);
  } catch (e) {
    handleError(e);
  }
};
