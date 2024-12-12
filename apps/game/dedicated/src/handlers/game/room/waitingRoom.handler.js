import Ghost from '../../../classes/models/ghost.class.js';
import Item from '../../../classes/models/item.class.js';
import { Position } from '../../../classes/models/moveInfo.class.js';
import { PACKET_TYPE } from '../../../constants/packet.js';
import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { handleError } from '../../../Error/error.handler.js';
import { startStageNotification } from '../../../notifications/room/room.notification.js';
import { blockInteractionNotification } from '../../../notifications/system/system.notification.js';
import { getGameSessionById } from '../../../sessions/game.session.js';
import { getUserById } from '../../../sessions/user.sessions.js';
import { createPacketS2G } from '../../../utils/packet/create.packet.js';

export const startStageRequestHandler = ({ socket, payload }) => {
  try {
    const { gameSessionId, difficultyId } = payload;

    const gameSession = getGameSessionById(gameSessionId);
    if (!gameSession) {
      throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
    }

    // TODO : 임의로 전달받은 difficultyId에 100을 더해서 사용한다.
    gameSession.difficultyId = difficultyId + 100;

    // 게임이 시작되기 전까지 모든 플레이어게게 Block하도록 알려주는 blockInteractionNotification을 보낸다.
    blockInteractionNotification(gameSession);

    // host인 플레이어에게 아이템을 생성하도록 알려주는 SpawnInitialDataRequest를 보낸다.
    const hostUser = gameSession.getUser(gameSession.hostId);

    const s2cRequestPayload = {
      globalFailCode: 0,
      difficultyId,
      message: '게임 시작을 요청합니다.',
    };

    const packet = createPacketS2G(
      PACKET_TYPE.game.SpawnInitialDataRequest,
      s2cRequestPayload,
      socket.sequence++,
    );

    hostUser.socket.write(packet);
  } catch (e) {
    handleError(e);
  }
};

export const spawnInitialDataResponseHandler = async ({ socket, payload }) => {
  const { itemInfos } = payload;

  const user = getUserById(socket.userId);

  const gameSession = getGameSessionById(user.gameId);

  itemInfos.forEach((itemInfo) => {
    const item = new Item(
      itemInfo.itemId,
      itemInfo.itemTypeId,
      itemInfo.position ? itemInfo.position : new Position(),
    );
    gameSession.addItem(item);
  });

  startStageNotification(gameSession, socket.userId, itemInfos);

  await gameSession.startGame();
};
