import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { CHARACTER_STATE } from '../../../constants/state.js';
import config from '@peekaboo-ssr/config/game';
import { itemDiscardResponse } from '../../../response/item/item.response.js';
import { itemDiscardNotification } from '../../../notifications/item/item.notification.js';
import IntervalManager from '../../../classes/managers/interval.manager.js';
import {
  removeUserRedis,
  removeUserRedisFromGame,
} from '../../../redis/user.redis.js';
import {
  disconnectPlayerNotification,
  kickRoomNotification,
} from '../../../notifications/room/room.notification.js';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';

// 클라이언트가 게임 세션을 자의로 나간 경우 발생하는 이벤트
export const disconnectRoomHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    // 1. 유저를 체크 및 유저 삭제 진행
    const removeUserIndex = server.game.users.findIndex(
      (user) => user.clientKey === clientKey,
    );
    if (removeUserIndex < 0) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }
    const user = server.game.users.splice(removeUserIndex, 1);

    // 2. 캐릭터가 살아있다면
    if (user[0].character.life > 0) {
      // 2-1. 캐릭터 아이템을 뿌려주기
      console.log('유저 연결 끊겨 삭제');
      user[0].character.life = 0;
      user[0].character.state = CHARACTER_STATE.DIED;
      const length = user[0].character.inventory.slot.length;
      for (let i = 0; i < length; i++) {
        const itemId = user[0].character.inventory.removeInventorySlot(i);
        if (itemId) {
          // 여기 나중에 합쳐줘도 괜찮을 것 같음.
          itemDiscardResponse(user[0].clientKey, server.game.socket, i + 1);
          itemDiscardNotification(server.game, user[0].id, itemId);
        }
      }
      // 2-2. 사망 처리 lifeResponse를 보냄
      const lifePayload = {
        life: user[0].character.life,
        isAttacked: true,
      };
      lifeResponse(socket, user[0].clientKey, lifePayload);
    }

    // 3. 탈출, 사망 상태라면 그냥 진행 (뭔가 작업을 해줘야하나?? 잘 모르겠음) : 윤수빈
    // 4. 유저의 인터벌 삭제
    IntervalManager.getInstance().removeUserInterval(user[0].id);

    // 5. 유저 삭제를 통지
    disconnectPlayerNotification(server.game, user[0].id);

    // 6. 게이트웨이 및 세션 서비스에서 해당 유저 세션을 로비로 옮겨주는 작업 진행
    // S2S 로 게이트웨이
    const s2sPayload = {
      clientKey,
      gameSessionKey: `${server.context.host}:${server.context.port}`,
      gameSessionId: server.game.id,
    };
    const s2sPacket = createPacketS2S(
      config.servicePacket.ExitDedicatedRequestBySelf,
      'dedicated',
      'gateway',
      s2sPayload,
    );
    server.clientToDistributor.write(s2sPacket);

    // 7. 인원이 없는 경우 모든 인터벌 삭제 및 데디 삭제
    // 8. 호스트인 경우 남아있는 유저를 로비로 내쫓도록 수정
    if (user[0].id === server.game.hostId) {
      // kickNotification을 남아있는 유저에게 보냄
      kickRoomNotification(server.game);

      // 9. 모든 유저를 게임 인스턴스에서 삭제
      server.game.users.splice(0, server.game.users.length);
    } else {
      // 10. 유저 레디스에서 게임 세션 정보 삭제
      await removeUserRedisFromGame(user.id, server.game.id);
    }

    // 11. 인원이 없는 경우 모든 인터벌 삭제
    // 12. 인원이 없는 경우 데디 바로 종료
    server.game.checkRemainUsers(server.game);
  } catch (e) {
    handleError(e);
  }
};
