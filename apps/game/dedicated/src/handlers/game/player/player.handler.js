import { GHOST_TYPE_ID } from '../../../constants/ghost.js';
import { PACKET_TYPE } from '../../../constants/packet.js';
import { CHARACTER_STATE } from '../../../constants/state.js';
import CustomError from '../../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../../Error/error.codes.js';
import { itemDiscardNotification } from '../../../notifications/item/item.notification.js';
import { playerStateChangeNotification } from '../../../notifications/player/player.notification.js';
import { itemDiscardResponse } from '../../../response/item/item.response.js';
import { getUserByClientKey } from '../../../sessions/user.sessions.js';
import { createPacketS2G } from '../../../utils/packet/create.packet.js';

export const playerStateChangeRequestHandler = async ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { playerStateInfo } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    user.character.state = playerStateInfo.characterState;

    playerStateChangeNotification(server.game, payload);

    // console.log(`player State : ${playerStateInfo.characterState}`);

    // 만약 player 한명이라도 탈출했다면 스테이지 종료한다.
    if (user.character.state === CHARACTER_STATE.EXIT) {
      await server.game.stageEnd();
      // if (.checkStageEnd()) {
      //   // 스테이지 종료 조건이 만족했다면,

      // }
    }
  } catch (e) {
    handleError(e);
  }
};

export const playerAttackedRequestHandler = async ({
  socket,
  clientKey,
  payload,
  server,
}) => {
  try {
    const { userId, ghostId } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
    }

    const ghost = server.game.getGhost(ghostId);
    if (!ghost) {
      throw new CustomError(ErrorCodesMaps.GHOST_NOT_FOUND);
    }

    //어택 타입에 따른 life 수치 조절, user.character.state 변경
    ghost.attack(user);

    if (user.character.life <= 0) {
      user.character.state = CHARACTER_STATE.DIED;
    } else {
      user.character.state = CHARACTER_STATE.ATTACKED;
    }

    const lifePayload = {
      life: user.character.life,
    };

    const packet = createPacketS2G(
      PACKET_TYPE.PlayerLifeResponse,
      lifePayload,
      socket.sequence++,
    );

    socket.write(packet);

    const playerStateInfo = {
      userId: userId,
      characterState: user.character.state,
    };

    playerStateChangeNotification(server.game, playerStateInfo);

    // 만약 player가 죽었다면
    // 아이템을 바닥에 뿌린다.
    // 스테이지 종료를 검사한다.
    if (user.character.state === CHARACTER_STATE.DIED) {
      const length = user.character.inventory.slot.length;

      for (let i = 0; i < length; i++) {
        const itemId = user.character.inventory.removeInventorySlot(i);
        if (!itemId) {
          itemDiscardResponse(socket, i + 1);
          itemDiscardNotification(user.id, itemId);
        }
      }

      await server.game.stageEnd();
      // if (.checkStageEnd()) {
      //   // 스테이지 종료 조건이 만족했다면, 스테이지를 종료시킨다.

      // }
    }
  } catch (e) {
    handleError(e);
  }
};
