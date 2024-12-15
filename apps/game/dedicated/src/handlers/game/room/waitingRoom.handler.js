import Ghost from '../../../classes/models/ghost.class.js';
import Item from '../../../classes/models/item.class.js';
import { Position } from '../../../classes/models/moveInfo.class.js';
import { PACKET_TYPE } from '../../../constants/packet.js';
import { GAME_SESSION_STATE } from '../../../constants/state.js';
import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { handleError } from '../../../Error/error.handler.js';
import { startStageNotification } from '../../../notifications/room/room.notification.js';
import {
  blockInteractionNotification,
  submissionEndNotification,
} from '../../../notifications/system/system.notification.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import { createPacketS2G } from '../../../utils/packet/create.packet.js';

export const startStageRequestHandler = ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { gameSessionId, difficultyId } = payload;

    if (server.game.day === 0) {
      const submissionResult = server.game.endSubmission();
      submissionEndNotification(server.game, submissionResult);
      if (!submissionResult) {
        // submission에 실패했다면 다른 처리를 해야될 거 같다...
        // 귀신 매우매우 많이 스폰???
        // 플레이어가 자연스럽게 죽고 첫날로 돌아갈 수 있게 할 수 위한 로직이 있어야 함.
        return;
      }
    }
    // 게임이 이미 플레이 중이라면
    if (server.game.state === GAME_SESSION_STATE.INPROGRESS) {
      console.log(`이미 게임 플레이 중입니다.`);
      throw new CustomError(ErrorCodesMaps.INVALID_PACKET);
    }

    // TODO : 임의로 전달받은 difficultyId에 100을 더해서 사용한다.
    server.game.setDifficulty(difficultyId);

    // 게임이 시작되기 전까지 모든 플레이어게게 Block하도록 알려주는 blockInteractionNotification을 보낸다.
    blockInteractionNotification(server.game);

    // host인 플레이어에게 아이템을 생성하도록 알려주는 SpawnInitialDataRequest를 보낸다.
    const hostUser = server.game.getUser(server.game.hostId);
    if (!hostUser) {
      console.error(`호스트 유저가 없습니다.`);
    }

    const s2cRequestPayload = {
      globalFailCode: 0,
      difficultyId,
      message: '게임 시작을 요청합니다.',
    };

    const packet = serializer(
      PACKET_TYPE.SpawnInitialDataRequest,
      s2cRequestPayload,
      socket.sequence++,
    );

    hostUser.socket.write(packet);
  } catch (e) {
    handleError(e);
  }
};

export const spawnInitialDataResponseHandler = async ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { itemInfos } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);

    itemInfos.forEach((itemInfo) => {
      const item = new Item(
        itemInfo.itemId,
        itemInfo.itemTypeId,
        itemInfo.position ? itemInfo.position : new Position(),
      );
      server.game.addItem(item);
    });

    startStageNotification(server.game, itemInfos);

    await server.game.startStage();
  } catch (e) {
    handleError(e);
  }
};
