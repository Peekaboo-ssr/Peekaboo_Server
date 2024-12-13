import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import Item from '../../../classes/models/item.class.js';
import { itemCreateNotification } from '../../../notifications/item/item.notification.js';
import { handleError } from '../../../Error/error.handler.js';

export const itemCreateHandler = ({ socket, clientKey, payload, server }) => {
  try {
    const { itemTypeId } = payload;
    //일단 이부분 빼달래요
    // 아이템타입 id 검증
    if (itemTypeId < 2014 || itemTypeId > 2106) {
      console.log(`Item Create Error => ItemType : ${itemTypeId}`);
      return;
    }

    const user = getUserByClientKey(clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
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
