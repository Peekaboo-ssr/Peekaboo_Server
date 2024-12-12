// 서버에서 사용할 에러 코드들 정의
const errorCodesMap = {
  SOCKET_ERROR: {
    code: 10000,
    message: '소켓 에러 발생',
  },
  CLIENT_VERSION_MISMATCH: {
    code: 10001,
    message: '클라이언트 버전 불일치',
  },
  UNKNOWN_HANDLER_ID: {
    code: 10002,
    message: '알 수 없는 핸들러 ID',
  },
  PACKET_DECODE_ERROR: {
    code: 10003,
    message: '패킷 디코딩 오류',
  },
  PACKET_STRUCTURE_MISMATCH: {
    code: 10004,
    message: '패킷 구조 불일치',
  },
  MISSING_FIELDS: {
    code: 10005,
    message: '필드 누락',
  },
  USER_NOT_FOUND: {
    code: 10006,
    message: '사용자를 찾을 수 없음',
  },
  INVALID_PACKET: {
    code: 10007,
    message: '유효하지 않은 패킷',
  },
  INVALID_SEQUENCE: {
    code: 10008,
    message: '유효하지 않은 시퀀스',
  },
  GAME_NOT_FOUND: {
    code: 10009,
    message: '게임을 찾을 수 없음',
  },
  UNKNOWN_PROTOTYPE_NAME: {
    code: 10010,
    message: '알 수 없는 프로토타입 이름',
  },
  DUPLICATED_USER_CONNECT: {
    code: 10011,
    message: '중복된 사용자 연결',
  },
  DB_QUERY_ERROR: {
    code: 10012,
    message: 'DB 쿼리 오류',
  },
  HANDLER_ERROR: {
    code: 10013,
    message: '핸들러 오류',
  },
  PROTOBUF_LOAD_ERROR: {
    code: 10014,
    message: '프로토콜 버퍼 로드 오류',
  },
  AUTHENTICATION_ERROR: {
    code: 10015,
    message: '유저 검증 오류',
  },
  GHOST_NOT_FOUND: {
    code: 10016,
    message: '귀신 검증 오류',
  },
  ITEM_NOT_FOUND: {
    code: 10017,
    message: '아이템 검증 오류',
  },
  ITEM_DETERIORATION: {
    code: 10018,
    message: '아이템 검증 오류',
  },
};

export default errorCodesMap;
