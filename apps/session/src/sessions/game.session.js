export const gameSessions = {};

/**
 * 세션에 대한 정리
 *
 * gameSessions : {
 *  [gameSessionId] : {
 *      dedicateKey,
 *      distributorKey,
 *      inviteCode
 *  }, ...
 * }
 */

// S2S 라우팅할 때 필요하기 때문에 선언 + 대기실에서 참가
export const getGameByGameSessionId = (gameSessionId) => {
  return gameSessions[gameSessionId];
};

// S2S 라우팅할 때 필요하기 때문에 선언 + 초대코드로 참가
export const getGameByInviteCode = (inviteCode) => {
  for (const [key, value] of Object.entries(gameSessions)) {
    if (value.inviteCode === inviteCode) {
      return value;
    }
  }
  return null;
};
