import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
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
import { getGameSessionById } from '../../../sessions/game.session.js';
import { getUserById } from '../../../sessions/user.sessions.js';

// 아마도 불큐 사용할 구간
export const itemGetRequestHandler = async ({ socket, payload }) => {
  const { itemId, inventorySlot } = payload;
  console.log(socket.userId, '슬롯확인----------', inventorySlot);
  const user = getUserById(socket.userId);
  if (!user) {
    throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
  }

  const gameSession = getGameSessionById(user.gameId);
  if (!gameSession) {
    throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
  }

  // 동시성 제어 1(불큐)
  // 실질적인 아이템 저장
  await gameSession.itemQueue.queue.add(
    {
      userId: socket.userId,
      itemId,
      inventorySlot,
    },
    { jobId: `getItem:${itemId}`, removeOnComplete: true },
  );
};

export const itemChangeRequestHandler = async ({ socket, payload }) => {
  const { inventorySlot } = payload;

  const slot = inventorySlot - 1;

  const user = getUserById(socket.userId);
  if (!user) {
    throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
  }

  const gameSession = getGameSessionById(user.gameId);
  if (!gameSession) {
    throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
  }

  const itemId = user.character.inventory.slot[slot];

  // 손에 들어주기
  itemChangeNotification(gameSession, socket.userId, itemId);
};

export const itemUseRequestHandler = async ({ socket, payload }) => {
  const { inventorySlot } = payload;

  const slot = inventorySlot - 1;

  const user = getUserById(socket.userId);
  if (!user) {
    throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
  }

  const gameSession = getGameSessionById(user.gameId);
  if (!gameSession) {
    throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
  }

  const itemId = user.character.inventory.slot[slot];

  const item = gameSession.getItem(itemId);

  if (!item) {
    throw new CustomError(ErrorCodesMaps.ITEM_NOT_FOUND);
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

  itemUseResponse(socket, itemId, inventorySlot);

  itemUseNotification(gameSession, socket.userId, itemId);
};

export const itemDiscardRequestHandler = async ({ socket, payload }) => {
  const { itemInfo, inventorySlot } = payload;

  if (!itemInfo.itemId) {
    return;
  }

  const slot = inventorySlot - 1;

  const user = getUserById(socket.userId);
  if (!user) {
    throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
  }

  const gameSession = getGameSessionById(user.gameId);
  if (!gameSession) {
    throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
  }

  const itemId = user.character.inventory.removeInventorySlot(slot);
  const item = gameSession.getItem(itemId);

  if (!item) {
    throw new CustomError(ErrorCodesMaps.ITEM_NOT_FOUND);
  }

  if (itemInfo.itemId !== itemId) {
    throw new CustomError(ErrorCodesMaps.ITEM_DETERIORATION);
  }

  item.mapOn = true;

  // item.position.updateClassPosition(itemInfo.position);
  item.position.updateClassPosition(user.character.position);

  itemDiscardResponse(socket, inventorySlot);

  itemDiscardNotification(gameSession, socket.userId, itemId);
};

export const itemDisuseRequestHandler = async ({ socket, payload }) => {
  const { itemId } = payload;

  const user = getUserById(socket.userId);
  if (!user) {
    throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
  }

  const gameSession = getGameSessionById(user.gameId);
  if (!gameSession) {
    throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
  }

  const item = gameSession.getItem(itemId);

  if (!item) {
    throw new CustomError(ErrorCodesMaps.ITEM_NOT_FOUND);
  }

  item.on = false;

  itemDisuseNotification(gameSession, socket.userId, itemId);
};
