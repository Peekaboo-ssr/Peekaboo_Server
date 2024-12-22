import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { lifeResponse } from '../../../response/player/life.response.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import { CHARACTER_STATE } from '../../../constants/state.js';

// 클라이언트에서 캐릭터가 생성될 때마다 보내는 패킷
// HP 동기화를 위한 핸들러
export const lifeUpdateHandler = (socket, clientKey, payload, server) => {
  console.log('lifeUpdateHandler.....');
  try {
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const lifePayload = {
      life: user.character.life,
      isAttacked: false,
    };

    lifeResponse(socket, clientKey, lifePayload);
  } catch (e) {
    handleError(e);
  }
};
