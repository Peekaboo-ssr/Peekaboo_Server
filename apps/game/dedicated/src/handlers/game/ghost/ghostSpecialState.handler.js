import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { ghostSpecialStateNotification } from '../../../notifications/ghost/ghost.notification.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

/**
 * 귀신의 특수 상태 요청에 대한 핸들러 함수입니다. (호스트만 요청)
 */
export const ghostSpecialStateRequestHandler = ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { ghostId, specialState, isOn } = payload;

    // user 검증
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    // 추후 특수 상태에 따른 변화 로직이 있으면 추가 TODO
    // switch(specialState) {

    // }

    ghostSpecialStateNotification(server.game, payload);
  } catch (e) {
    handleError(e);
  }
};
