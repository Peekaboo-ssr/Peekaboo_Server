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

    IntervalManager.getInstance().removeUserInterval(user[0].id);

    // 연결을 종료한 사실을 다른 유저들에게 disconnectPlayerNotification로 알려준다.
    await disconnectPlayerNotification(server.game, user[0].id);

    // 레디스에 유저 정보 저장 (세션 재접속을 위해 저장)
    // 자의로 나간 것인지 타의로 나간 것인지 확인하여 저장이 필요
    // 게임 세션이 사라지면 아래 레디스 정보에 세션 상태 업데이트 필요
    // 재접속을 시도했을 때 세션이 사라졌으면 레디스에서 삭제+접속불가
    // 재접속을 시도했을 때 세션이 남아있으면 재접속 수행
    await setUserRedis(user[0].id, user[0].gameId);

    // 호스트인 경우 남아있는 유저를 로비로 내쫓도록 수정 => 이건 disconnectPlayerNotification으로 하도록 함.

    // 인원이 없는 경우 모든 인터벌 삭제
    if (server.game.users.length <= 0) {
      IntervalManager.getInstance().clearAll();
      console.log('-------남은 유저가 없어 종료합니다-------');
      process.exit(1);
    }
  } catch (e) {
    handleError(e);
  }
};
