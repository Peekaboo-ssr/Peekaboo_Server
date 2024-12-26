import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { setUserRedis } from '../../redis/user.redis.js';
import IntervalManager from '../../classes/managers/interval.manager.js';
import {
  disconnectPlayerNotification,
  kickRoomNotification,
} from '../../notifications/room/room.notification.js';
import { playerStateChangeNotification } from '../../notifications/player/player.notification.js';
import { itemDiscardNotification } from '../../notifications/item/item.notification.js';

export const ExitDedicatedBySocketHandler = async (server, payload) => {
  try {
    const { clientKey } = payload;
    // 1. 유저를 체크 및 유저 삭제 진행
    const removeUserIndex = server.game.users.findIndex(
      (user) => user.clientKey === clientKey,
    );

    if (removeUserIndex < 0) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }
    const user = server.game.users.splice(removeUserIndex, 1);

    // 2. 인원이 없는 경우 모든 인터벌 삭제 및 데디 삭제
    // 3. 호스트인 경우 남아있는 유저를 로비로 내쫓도록 수정
    if (user[0].id === server.game.hostId) {
      // 3-1. kickNotification을 남아있는 유저에게 보냄
      kickRoomNotification(server.game);
      // 3-2. 모든 유저를 게임 인스턴스에서 삭제
      server.game.users.splice(0, server.game.users.length);
    } else {
      // 4. 캐릭터가 살아있다면
      if (user.character.life > 0) {
        // 4-1. 캐릭터 아이템을 뿌려주기
        user.character.life = 0;
        user.character.state = CHARACTER_STATE.DIED;
        const length = user.character.inventory.slot.length;
        for (let i = 0; i < length; i++) {
          const itemId = user.character.inventory.removeInventorySlot(i);
          if (itemId) {
            itemDiscardNotification(server.game, user.id, itemId);
          }
        }
        // 4-2. 사망 상태 통지
        const statePayload = {
          playerStateInfo: {
            userId: user[0].id,
            characterState: CHARACTER_STATE.DIED,
          },
        };
        playerStateChangeNotification(server, statePayload);
      }

      // 5. 유저의 인터벌 삭제
      IntervalManager.getInstance().removeUserInterval(user[0].id);

      // 6. 유저 삭제를 통지
      await disconnectPlayerNotification(server.game, user[0].id);

      // 7. 레디스에 유저 정보 저장 (세션 재접속을 위해 저장)
      // 게임 세션이 사라지면 아래 레디스 정보에 세션 상태 업데이트 필요
      // 재접속을 시도했을 때 세션이 사라졌으면 레디스에서 삭제+접속불가
      // 재접속을 시도했을 때 세션이 남아있으면 재접속 수행
      await setUserRedis(user[0].id, user[0].gameId);
    }

    // 8. 인원이 없는 경우 모든 인터벌 삭제 및 데디 종료
    server.game.checkRemainUsers(server.game);
  } catch (e) {
    handleError(e);
  }
};
