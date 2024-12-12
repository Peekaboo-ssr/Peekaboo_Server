import CustomError from '../../../Error/custom.error.js';
import { getGameSessionById } from '../../../sessions/game.session.js';
import { getUserById } from '../../../sessions/user.sessions.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { itemDeleteNotification } from '../../../notifications/item/item.notification.js';
import { extractSoulNotification } from '../../../notifications/extractor/extractor.notification.js';

export const extractorSoulHandler = async ({ socket, payload }) => {
  const { userId, itemId, inventorySlot } = payload;

  // ------------------------- 검증 -------------------------------
  // 유저 검증
  const user = getUserById(socket.userId);
  if (!user) {
    throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
  }

  // 게임 세션 검증
  const gameSession = getGameSessionById(user.gameId);
  if (!gameSession) {
    throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
  }

  // 아이템 검증
  const item = gameSession.getItem(itemId);
  if (!item) {
    throw new CustomError(ErrorCodesMaps.ITEM_NOT_FOUND);
  }

  // 인벤토리 검증
  // 유저의 인벤토리(Redis)에서 아이템 찾기
  const serverItemId = user.character.inventory.slot[inventorySlot - 1];

  if (!serverItemId) {
    throw new CustomError(ErrorCodesMaps.ITEM_NOT_FOUND);
  }

  // ------------------------- 로직 ------------------------------
  // TODO : 데이터 테이블에 명시된 소울 타입의 영혼 수치를 가져온다.
  // 테스트 용도로 모든 영혼의 가치를 10으로 고정했다.
  const soulValue = 10;

  // 영혼의 가치만큼 유저의 EXP와 MONEY를 올려준다. (Response)
  // TODO : DB에도 반영 ********************************************
  user.exp += soulValue;

  // submission의 영혼 추출 현재 수치를 영혼의 가치만큼 올려준다. (Notification)
  gameSession.currentSoulAmount += soulValue;

  // 유저의 인벤토리(Redis)에서 영혼 아이템을 삭제시켜준다.
  await removeItemRedis(socket.userId, inventorySlot);

  // 게임에서 해당 아이템(소울)을 삭제시킨다. (Notification)
  gameSession.removeItem(itemId);

  // ---------------------- 패킷 송신 ----------------------------
  // 추출한 영혼 아이템 삭제 Noti
  itemDeleteNotification(gameSession, itemId);

  // 영혼 누적 추출량 Noti
  extractSoulNotification(gameSession, gameSession.currentSoulAmount);
};
