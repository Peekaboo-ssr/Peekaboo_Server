import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { setUserRedis } from '../../redis/user.redis.js';
import IntervalManager from '../../classes/managers/interval.manager.js';
import { disconnectPlayerNotification } from '../../notifications/system/system.notification.js';

export const exitDedicatedHandler = async (server, payload) => {
  console.log('exitUser....');
  const { clientKey } = payload;

  try {
    const removeUserIndex = server.game.users.findIndex(
      (user) => user.clientKey === clientKey,
    );

    if (removeUserIndex < 0) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const user = server.game.users.splice(removeUserIndex, 1);

    IntervalManager.getInstance().removeUserInterval(user.id);

    // 연결을 종료한 사실을 다른 유저들에게 disconnectPlayerNotification로 알려준다.
    await disconnectPlayerNotification(server.game, user.id);

    // 레디스에 유저 정보 저장
    await setUserRedis(user.id, user.gameId);

    // 인원이 없는 경우 모든 인터벌 삭제
    if (server.game.users.length <= 0) {
      IntervalManager.getInstance().clearAll();
      console.log('-------남은 유저가 없어 종료합니다-------');
      // 아래 데디 자동 끄기는 로깅작업이 끝나면 진행하도록 함.
      // process.exit(1);
    }
  } catch (e) {
    handleError(e);
  }
};
