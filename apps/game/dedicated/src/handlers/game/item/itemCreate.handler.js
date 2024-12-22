import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import Item from '../../../classes/models/item.class.js';
import { itemCreateNotification } from '../../../notifications/item/item.notification.js';
import handleError from '@peekaboo-ssr/error/handleError';

export const itemCreateHandler = (socket, clientKey, payload, server) => {
  try {
    const { itemTypeId } = payload;

    // 아이템타입 id 검증
    if (itemTypeId < 2014 || itemTypeId > 2106) {
      throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    }

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const newItemId = server.game.items[server.game.items.length - 1].id + 1;

    // 상점 근처에 있는 고정된 포지션 상점에서 구입시 바닥에 떨구는 형식으로 하기로 함
    // 임시로 유저 캐릭터 포지션
    const storePosition = user.character.position.getPosition();

    const item = new Item(newItemId, itemTypeId, storePosition);

    server.game.addItem(item);

    const itemInfo = {
      itemId: item.id,
      itemTypeId: item.typeId,
      position: storePosition,
    };

    itemCreateNotification(server.game, itemInfo);
  } catch (e) {
    handleError(e);
  }
};
