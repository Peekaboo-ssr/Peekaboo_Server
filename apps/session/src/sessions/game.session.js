/**
 * 세션에 대한 정리
 *
 * gameSessions : {
 *  [gameSessionId] : {
 *      dedicateKey,
 *      distributorKey,
 *      inviteCode,
 *      numberOfPlayer,
 *      latency,
 *      state,
 *  }, ...
 * }
 */

import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

// S2S 라우팅할 때 필요하기 때문에 선언 + 대기실에서 참가
export const getGameByGameSessionId = (gameSessions, gameSessionId) => {
  return gameSessions[gameSessionId];
};

// S2S 라우팅할 때 필요하기 때문에 선언 + 초대코드로 참가
export const getGameByInviteCode = (gameSessions, inviteCode) => {
  for (const [key, value] of Object.entries(gameSessions)) {
    if (value.inviteCode === inviteCode) {
      return value;
    }
  }
  console.log('getGameByInviteCode 데디케이티드 찾지 못함.');
  return null;
};

export const exitGameByGameSessionId = (server, gameSessionId) => {
  const gameSession = server.gameSessions[gameSessionId];
  if (!gameSession) {
    throw new CustomError(errorCodesMap.GAME_NOT_FOUND);
  }
  // 게임 세션의 현재 유저수 차감
  gameSession.numberOfPlayer -= 1;
  // 게임 세션의 현재 유저수 차감 후 인원이 0인 경우 삭제하도록 함
  if (gameSession.numberOfPlayer <= 0) {
    delete server.gameSessions[gameSessionId];
  }
};

export const findGameByDedicateKey = (gameSessions, dedicateKey) => {
  for (const [key, value] of Object.entries(gameSessions)) {
    if (value.dedicateKey === dedicateKey) {
      return key;
    }
  }
  console.log('dedicateKey를 통한 데디케이티드 찾지 못함.');
  return null;
};
