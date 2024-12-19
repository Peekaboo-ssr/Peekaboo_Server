import handleError from '@peekaboo-ssr/error/handleError';
import { getUserByClientKey } from '../../../sessions/user.sessions';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { lifeResponse } from '../../../response/player/life.response.js';

// 클라이언트에서 캐릭터가 생성될 때마다 보내는 패킷
// HP 동기화를 위한 핸들러
export const lifeUpdateHandler = (socket, clientKey, payload, server) => {
  console.log('lifeUpdateHandler.....');
  try {
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    if (user.character.state === CHARACTER_STATE.DIED) {
      user.character.life = 1;
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
