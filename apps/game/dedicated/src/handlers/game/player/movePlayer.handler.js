import CustomError from '../../../Error/custom.error.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import { usersLocationNotification } from '../../../notifications/player/player.notification.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { handleError } from '../../../Error/error.handler.js';

// 플레이어 이동 요청에 따른 핸들러 함수
export const movePlayerRequestHandler = ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { playerMoveInfo } = payload;

    const { userId, position, rotation } = playerMoveInfo;

    // 유저 찾기
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    //이전 값 저장
    user.character.lastPosition.updateClassPosition(user.character.position);
    user.character.lastRotation.updateClassRotation(user.character.rotation);

    //수정 해야함
    user.character.position.updatePosition(position.x, position.y, position.z);
    user.character.rotation.updateRotation(rotation.x, rotation.y, rotation.z);

    //시간 저장
    user.character.lastUpdateTime = Date.now();

    usersLocationNotification(server.game);
  } catch (e) {
    console.error(`${e.message}`);
  }
};
