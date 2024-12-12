/**
 * 클라이언트 to 게이트
 *
 * 패킷정의: 명세 참고
 */
const CLIENTS_HEADER = {
  typeLength: 2,
  versionLength: 1,
  payloadLength: 4,
  sequenceLength: 4,
  clientKeyLength: 1,
};

export default CLIENTS_HEADER;
