import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { startStageNotification } from '../../../notifications/room/room.notification.js';
import {
  blockInteractionNotification,
  submissionEndNotification,
} from '../../../notifications/system/system.notification.js';
import config from '@peekaboo-ssr/config/game';

export const startStageRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { gameSessionId } = payload;
  try {
    // 난이도 선택이 되지 않았다면 1차 방어
    if (server.game.difficultId === null) {
      console.log('난이도 선택이 되지않았습니다.');
      throw new CustomError(errorCodesMap.INVALID_REQUEST);
    }

    // 게임이 이미 플레이 중이라면 2차 방어
    if (server.game.state === config.clientState.gameState.INPROGRESS) {
      console.log(`이미 게임 플레이 중입니다.`);
      throw new CustomError(errorCodesMap.INVALID_PACKET);
    }

    // 서브미션 실패라면 반환하도록 3차 방어
    if (server.game.state === config.clientState.gameState.FAIL) {
      console.log(`서브미션 실패로 시작할 수 없습니다.`);
      throw new CustomError(errorCodesMap.INVALID_PACKET);
    }

    // 게임이 시작되기 전까지 모든 플레이어에게 상호작용 Block
    blockInteractionNotification(server.game);

    // host인 플레이어에게 아이템을 생성하도록 알려주는 SpawnInitialDataRequest를 보낸다.
    const hostUser = server.game.getUser(server.game.hostId);
    if (!hostUser) {
      console.error(`호스트 유저가 없습니다.`);
    }

    // TODO : 고스트와 아이템 difficultyId에 맞게 소환
    const itemInfos = server.game.spawnItems();
    const ghostInfos = server.game.spawnGhosts();

    startStageNotification(server.game, itemInfos, ghostInfos);

    await server.game.startStage();
  } catch (e) {
    handleError(e);
  }
};
