import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { setUserRedis } from '../../redis/user.redis.js';
import IntervalManager from '../../classes/managers/interval.manager.js';
import {
  disconnectPlayerNotification,
  kickRoomNotification,
} from '../../notifications/room/room.notification.js';

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

    // 2. 캐릭터가 살아있다면
    if (user.character.life > 0) {
      // 2-1. 캐릭터 아이템을 뿌려주기
      console.log('유저 연결 끊겨 삭제');
      user.character.life = 0;
      user.character.state = CHARACTER_STATE.DIED;
      const length = user.character.inventory.slot.length;
      for (let i = 0; i < length; i++) {
        const itemId = user.character.inventory.removeInventorySlot(i);
        if (itemId) {
          // 여기 나중에 합쳐줘도 괜찮을 것 같음.
          itemDiscardResponse(user.clientKey, server.game.socket, i + 1);
          itemDiscardNotification(server.game, user.id, itemId);
        }
      }
      // 2-2. 사망 처리 lifeResponse를 보냄
      const lifePayload = {
        life: user.character.life,
        isAttacked: true,
      };
      lifeResponse(socket, user.clientKey, lifePayload);
    }

    IntervalManager.getInstance().removeUserInterval(user[0].id);

    // 연결을 종료한 사실을 다른 유저들에게 disconnectPlayerNotification로 알려준다.
    await disconnectPlayerNotification(server.game, user[0].id);

    // 레디스에 유저 정보 저장 (세션 재접속을 위해 저장)
    // 게임 세션이 사라지면 아래 레디스 정보에 세션 상태 업데이트 필요
    // 재접속을 시도했을 때 세션이 사라졌으면 레디스에서 삭제+접속불가
    // 재접속을 시도했을 때 세션이 남아있으면 재접속 수행
    await setUserRedis(user[0].id, user[0].gameId);

    // 호스트인 경우 남아있는 유저를 로비로 내쫓도록 수정
    if (user[0].id === server.game.hostId) {
      // kickNotification을 남아있는 유저에게 보냄
      // kick 하면서 레디스에서 게임 정보 삭제
      kickRoomNotification(server.game);
      // 모든 유저를 게임 인스턴스에서 삭제
      server.game.users.splice(0, server.game.users.length);
    }

    // 인원이 없는 경우 모든 인터벌 삭제
    // 인원이 없는 경우 데디 바로 종료
    server.game.checkRemainUsers(server.game);
  } catch (e) {
    handleError(e);
  }
};
