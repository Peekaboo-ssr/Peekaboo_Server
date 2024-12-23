import { CHARACTER_STATE } from '../../../constants/state.js';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { playerStateChangeNotification } from '../../../notifications/player/player.notification.js';
import {
  getUserByClientKey,
  getUserByUserID,
} from '../../../sessions/user.sessions.js';
import { lifeResponse } from '../../../response/player/life.response.js';
import { itemDiscardResponse } from '../../../response/item/item.response.js';
import { itemDiscardNotification } from '../../../notifications/item/item.notification.js';

export const playerStateChangeRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { playerStateInfo } = payload;

    const user = getUserByClientKey(server.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    if (
      user.character.state !== CHARACTER_STATE.DIED ||
      user.character.state !== CHARACTER_STATE.EXIT
    ) {
      user.character.state = playerStateInfo.characterState;

      switch (playerStateInfo.characterState) {
        case CHARACTER_STATE.RUN:
          user.character.speed = server.game.gameAssets.player.data[0].RunSpeed;
          break;
        case CHARACTER_STATE.JUMP:
          break;
        default:
          user.character.speed =
            server.game.gameAssets.player.data[0].WalkSpeed;
      }

      playerStateChangeNotification(server.game, payload);

      // 만약 player 한명이라도 탈출했다면 스테이지 종료한다.
      if (user.character.state === CHARACTER_STATE.EXIT) {
        await server.game.endStage();
        // if (.checkStageEnd()) {
        //   // 스테이지 종료 조건이 만족했다면,

        // }
      }
    }
  } catch (e) {
    handleError(e);
  }
};

// !! 호스트가 맞은 유저의 아이디를 보내준다.
export const playerAttackedRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { userId, ghostId } = payload;

    const user = getUserByUserID(server.game.users, userId);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    if (user.character.life > 0) {
      const ghost = server.game.getGhost(ghostId);
      if (!ghost) {
        throw new CustomError(errorCodesMap.GHOST_NOT_FOUND);
      }

      //어택 타입에 따른 life 수치 조절, user.character.state 변경
      await ghost.attack(user);

      // 만약 player가 죽었다면 아이템을 바닥에 뿌린다
      if (user.character.life <= 0) {
        user.character.state = CHARACTER_STATE.DIED;
        const length = user.character.inventory.slot.length;
        for (let i = 0; i < length; i++) {
          const itemId = user.character.inventory.removeInventorySlot(i);
          if (itemId) {
            // 여기 나중에 합쳐줘도 괜찮을 것 같음.
            itemDiscardResponse(user.clientKey, server.game.socket, i + 1);
            itemDiscardNotification(server.game, user.id, itemId);
          }
        }
      } else {
        user.character.state = CHARACTER_STATE.ATTACKED;
      }

      const lifePayload = {
        life: user.character.life,
        isAttacked: true,
      };
      lifeResponse(socket, user.clientKey, lifePayload);

      const playerStateInfo = {
        userId,
        characterState: user.character.state,
      };
      const playerStatePayload = {
        playerStateInfo,
      };
      playerStateChangeNotification(server.game, playerStatePayload);

      // 플레이어가 죽은 경우 스테이지 종료를 검사한다.
      // 위 플레이어 사망 조건문에서 바로 확인할 수 있지만 캐릭터 사망이 원활하게 이루어진 후
      // 스테이지 종료 조건을 확인하기 2중으로 체크하도록 함 : 윤수빈
      if (user.character.state === CHARACTER_STATE.DIED) {
        if (server.game.checkStageEnd()) {
          await server.game.endStage();
        }
      }
    }
  } catch (e) {
    handleError(e);
  }
};
