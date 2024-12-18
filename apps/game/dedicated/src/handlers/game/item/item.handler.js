import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import {
  itemChangeNotification,
  itemDiscardNotification,
  itemDisuseNotification,
  itemUseNotification,
} from '../../../notifications/item/item.notification.js';
import {
  itemDiscardResponse,
  itemUseResponse,
} from '../../../response/item/item.response.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';

// 아마도 불큐 사용할 구간
export const itemGetRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { itemId, inventorySlot } = payload;
    const user = getUserByClientKey(server.game.users, clientKey);
    console.log(user.id, '슬롯확인----------', inventorySlot);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    // 동시성 제어 1(불큐)
    // 실질적인 아이템 저장
    await server.game.gameQueue.queue.add(
      {
        type: 'item',
        data: { clientKey, itemId, inventorySlot },
      },
      { jobId: `getItem:${itemId}`, removeOnComplete: true },
    );
  } catch (e) {
    handleError(e);
  }
};

export const itemChangeRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { inventorySlot } = payload;

    const slot = inventorySlot - 1;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const itemId = user.character.inventory.slot[slot];

    // 손에 들어주기
    itemChangeNotification(server.game, user.id, itemId);
  } catch (e) {
    handleError(e);
  }
};

export const itemUseRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { inventorySlot } = payload;

    const slot = inventorySlot - 1;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const itemId = user.character.inventory.slot[slot];

    const item = server.game.getItem(itemId);

    if (!item) {
      throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    }

    //아이템 타입에 따라 사용 가능 불가능 구분하여 적용
    switch (item.typeId) {
      case 2104:
        break;
      default:
        return;
    }

    item.on = true;

    //추후 아이템 타입에 따른 핸들링 필요

    itemUseResponse(user.clientKey, server.game.socket, itemId, inventorySlot);

    itemUseNotification(server.game, user.id, itemId);
  } catch (e) {
    handleError(e);
  }
};

export const itemDiscardRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { itemInfo, inventorySlot } = payload;

    if (!itemInfo.itemId) {
      return;
    }

    const slot = inventorySlot - 1;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const itemId = user.character.inventory.removeInventorySlot(slot);
    const item = server.game.getItem(itemId);

    if (!item) {
      throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    }

    if (itemInfo.itemId !== itemId) {
      throw new CustomError(errorCodesMap.ITEM_DETERIORATION);
    }

    // item.position.updateClassPosition(itemInfo.position);
    item.position.updateClassPosition(user.character.position);

    itemDiscardResponse(user.clientKey, server.game.socket, inventorySlot);

    itemDiscardNotification(server.game, user.id, itemId);
  } catch (e) {
    handleError(e);
  }
};

export const itemDisuseRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { itemId } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const item = server.game.getItem(itemId);

    if (!item) {
      throw new CustomError(errorCodesMap.ITEM_NOT_FOUND);
    }

    item.on = false;

    itemDisuseNotification(server.game, user.id, itemId);
  } catch (e) {
    handleError(e);
  }
};
