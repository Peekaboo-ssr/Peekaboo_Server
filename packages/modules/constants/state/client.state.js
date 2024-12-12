// 클라이언트의 각 상태에 대한 상수를 정의한 파일
const clientState = {
  globalFailCode: {
    NONE: 0,
    UNKNOWN_ERROR: 1,
    INVALID_REQUEST: 2,
    AUTHENTICATION_FAILED: 3,
  },
  userState: {
    STAY: 0,
    INGAME: 1,
  },
};

export default clientState;
