import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import { itemDeleteNotification } from '../../../notifications/item/item.notification.js';
import { extractSoulNotification } from '../../../notifications/extractor/extractor.notification.js';

export const extractorSoulHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { userId } = payload;

    // ------------------------- 검증 -------------------------------
    // 유저 검증
    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    // 유저 인벤토리
    const userInventory = user.character.inventory.slot;
    // 인벤토리에 소울 아이템이 있는지 검증
    const soulItems = [];
    let soulValue = 0;
    userInventory.forEach((itemId, slot) => {
      if (!itemId) {
        console.error(`[${slot}] inventory : empty`);
        return;
      }
      const item = server.game.items.find((item) => item.id === itemId);
      if (!item) {
        console.error(`Extractor : Item Not Exist`);
        return;
      }
      if (!server.game.spawnSoulItem.includes(item.typeId)) {
        console.error(`Extractor : Item is Not SoulItem`);
        return;
      }
      const soulItemData = server.game.gameAssets.item.data.find(
        (data) => data.Id === item.typeId,
      );
      soulValue += soulItemData.Value;
      // inventory에서 제거
      user.character.inventory.removeInventorySlot(slot);
      // 게임세션의 items에서 제거
      server.game.removeItem(itemId);
      soulItems.push(item.id);
    });
    itemDeleteNotification(server.game, soulItems);
    server.game.soulCredit += soulValue;
    extractSoulNotification(server.game, server.game.soulCredit);

    // 아이템 검증
    // const item = server.game.getItem(itemId);
    // if (!item) {
    //   throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    // }

    // // 인벤토리 검증
    // // 유저의 인벤토리(Redis)에서 아이템 찾기
    // const serverItemId = user.character.inventory.slot[inventorySlot - 1];

    // if (!serverItemId) {
    //   throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    // }

    // // ------------------------- 로직 ------------------------------
    // // TODO : 데이터 테이블에 명시된 소울 타입의 영혼 수치를 가져온다.
    // // 테스트 용도로 모든 영혼의 가치를 10으로 고정했다.
    // const soulValue = server.game.gameAssets.item.data.find(itemId);

    // // 영혼의 가치만큼 유저의 EXP와 MONEY를 올려준다. (Response)
    // // TODO : DB에도 반영 ********************************************
    // user.exp += soulValue;

    // // submission의 영혼 추출 현재 수치를 영혼의 가치만큼 올려준다. (Notification)
    // server.game.currentSoulAmount += soulValue;

    // // 유저의 인벤토리(Redis)에서 영혼 아이템을 삭제시켜준다.
    // await removeItemRedis(user.id, inventorySlot);

    // // 게임에서 해당 아이템(소울)을 삭제시킨다. (Notification)
    // server.game.removeItem(itemId);

    // // ---------------------- 패킷 송신 ----------------------------
    // // 추출한 영혼 아이템 삭제 Notification
    // //itemDeleteNotification(server.game, itemId);

    // // 영혼 누적 추출량 Notification
    // extractSoulNotification(server.game);
  } catch (e) {
    handleError(e);
  }
};
