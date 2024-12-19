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

    const ghost = server.game.getGhost(ghostId);
    if (!ghost) {
      throw new CustomError(errorCodesMap.GHOST_NOT_FOUND);
    }

    //어택 타입에 따른 life 수치 조절, user.character.state 변경
    await ghost.attack(user);

    if (user.character.life <= 0) {
      console.log('주금');
      user.character.state = CHARACTER_STATE.DIED;
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

    console.log('플레이어 상태 변경: ', playerStatePayload);
    playerStateChangeNotification(server.game, playerStatePayload);

    // 만약 player가 죽었다면 아이템을 바닥에 뿌리고, 스테이지 종료를 검사한다.
    if (user.character.state === CHARACTER_STATE.DIED) {
      // TODO: 테스트 필요
      // const length = user.character.inventory.slot.length;

      // for (let i = 0; i < length; i++) {
      //   const itemId = user.character.inventory.removeInventorySlot(i);
      //   if (!itemId) {
      //     // 여기 나중에 합쳐줘도 괜찮을 것 같음.
      //     itemDiscardResponse(socket, i + 1);
      //     itemDiscardNotification(user.id, itemId);
      //   }
      // }

      if (server.game.checkStageEnd()) {
        // 스테이지 종료 조건이 만족했다면, 스테이지를 종료시킨다.
        await server.game.endStage();
      }
    }
  } catch (e) {
    handleError(e);
  }
};
