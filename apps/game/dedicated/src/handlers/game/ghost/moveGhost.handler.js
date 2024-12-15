import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { handleError } from '../../../Error/error.handler.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

// 호스트 유저만 요청을 보냅니다.
export const moveGhostRequestHandler = ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { ghostMoveInfos } = payload;

    // 유저 찾기
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    // 해당 게임 세션에 고스트들의 정보 저장
    ghostMoveInfos.forEach((ghostMoveInfo) => {
      const { ghostId, position } = ghostMoveInfo;

      const ghost = server.game.getGhost(ghostId);
      if (!ghost) {
        console.error('해당 귀신 정보가 존재하지 않습니다.');
      }
      ghost.position.updatePosition(position.x, position.y, position.z);
      // ghost.rotation.updateRotation(rotation.x, rotation.y, rotation.z);
    });
  } catch (e) {
    handleError(e);
  }
};
