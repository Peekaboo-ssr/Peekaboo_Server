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

export const findGameByDedicateKey = (gameSessions, dedicateKey) => {
  for (const [key, value] of Object.entries(gameSessions)) {
    if (value.dedicateKey === dedicateKey) {
      return key;
    }
  }
  return null;
};

export const exitGameByDedicateKey = (server, dedicateKey) => {
  const gameSessionId = findGameByDedicateKey(server.gameSessions, dedicateKey);
  if (!gameSessionId) {
    console.error('게임 삭제 도중');
    throw new CustomError(errorCodesMap.GAME_NOT_FOUND);
  }

  // 게임 세션의 현재 유저수 차감
  server.gameSessions[gameSessionId].numberOfPlayer -= 1;
  console.log('데디에서 인원 정상 차감됨.');
  // 게임 세션의 현재 유저수 차감 후 인원이 0인 경우 삭제하도록 함
  if (server.gameSessions[gameSessionId].numberOfPlayer <= 0) {
    delete server.gameSessions[gameSessionId];
    console.log('데디 정상 삭제됨.');
  }
};

export const exitGameByGameSessionId = (server, gameSessionId) => {
  const gameSession = server.gameSessions[gameSessionId];
  if (!gameSession) {
    throw new CustomError(errorCodesMap.GAME_NOT_FOUND);
  }
  // 게임 세션의 현재 유저수 차감
  gameSession.numberOfPlayer -= 1;
  console.log('데디에서 인원 정상 차감됨.');
  // 게임 세션의 현재 유저수 차감 후 인원이 0인 경우 삭제하도록 함
  if (gameSession.numberOfPlayer <= 0) {
    delete server.gameSessions[gameSessionId];
    console.log('데디 정상 삭제됨.');
  }
};
