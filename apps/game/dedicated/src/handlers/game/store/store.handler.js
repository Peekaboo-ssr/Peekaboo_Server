import Item from '../../../classes/models/item.class.js';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { itemPurchaseNotification } from '../../../notifications/item/item.notification.js';
import { itemPurchaseResponse } from '../../../response/item/item.response.js';
import handleError from '@peekaboo-ssr/error/handleError';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import CustomError from '@peekaboo-ssr/error/CustomError';
import { lifeResponse } from '../../../response/player/life.response.js';
import { extractSoulNotification } from '../../../notifications/extractor/extractor.notification.js';

export const itemPurchaseHandler = (socket, clientKey, payload, server) => {
  try {
    const { itemTypeId } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const itemData = server.game.gameAssets.item.data;

    const itemInfo = itemData.find((item) => item.Id === itemTypeId);
    if (!itemInfo) {
      throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    }

    if (server.game.soulCredit < itemInfo.Value) {
      itemPurchaseResponse(user.clientKey, server.game.socket, false);
      return;
    }

    // 아이템 가격만큼 골드 차감
    server.game.soulCredit -= itemInfo.Value;

    if (itemInfo.SpaceValue === 0) {
      // 아이템의 SpaceValue가 0이면 Heart 아이템으로 응답만
      // TODO : 하트 life + 2아이템이 있으면 따로 로직 수정해야됨.

      if (user.character.life >= user.character.maxLife) {
        itemPurchaseResponse(user.clientKey, server.game.socket, false);
        server.game.soulCredit += itemInfo.Value;
        return;
      }

      user.character.life += 1;

      itemPurchaseResponse(user.clientKey, server.game.socket, true);

      // HP 증가했다고 알려주는 Response 필요

      const lifePayload = {
        life: user.character.life,
        isAttacked: false,
      };

      lifeResponse(user.clientKey, server.game.socket, lifePayload);

      // 소울 크레딧 동기화를 위해 extrackSoulNotification을 보낸다.
      extractSoulNotification(server.game);
    } else {
      // 아이템의 SpaceValue가 1이상이면 랜턴
      const newItemId = server.game.getUniqueItemId();

      // 상점 근처에 있는 고정된 포지션 상점에서 구입시 바닥에 떨구는 형식으로 하기로 함
      const storePosition = {
        x: -14.0,
        y: 0.3,
        z: 23.0,
      };

      const item = new Item(newItemId, itemTypeId, storePosition);

      server.game.addItem(item);

      const itemInfo = {
        itemId: item.id,
        itemTypeId: item.typeId,
        position: storePosition,
      };

      itemPurchaseNotification(server.game, itemInfo);
    }
  } catch (e) {
    handleError(e);
  }
};
