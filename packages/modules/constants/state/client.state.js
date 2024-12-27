// 클라이언트의 각 상태에 대한 상수를 정의한 파일
const clientState = {
  globalFailCode: {
    NONE: 0,
    UNKNOWN_ERROR: 1,
    INVALID_REQUEST: 2,
    AUTHENTICATION_FAILED: 3,
    DUPLICATED_USER: 4,
    NOT_FOUND: 5,
    STARTED_GAME: 6,
    FULLED_GAME: 7,
  },
  userState: {
    STAY: 0,
    INGAME: 1,
  },
  gameState: {
    GAME_SESSION_STATE_NONE: 0,
    PREPARE: 1, // 준비단계
    INPROGRESS: 2, // 진행중
    END: 3, // 종료
    FAIL: 4, // 서브미션 실패
  },
};

export default clientState;
