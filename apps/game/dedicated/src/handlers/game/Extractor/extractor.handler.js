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
  } catch (e) {
    handleError(e);
  }
};
