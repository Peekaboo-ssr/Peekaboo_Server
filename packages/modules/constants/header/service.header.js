/**
 * 서비스 to 서비스,
 * 서비스 to distributor,
 * distributor to 서비스
 *
 * 패킷정의: TCP 통신
 *
 * [헤더]
 * 1. 패킷 타입 2 byte
 * 2. 보내는 서비스 길이 1 byte
 * 3. 보내는 서비스 bytes
 * 4. 받는 서비스 길이 1 byte
 * 5. 받는 서비스 bytes
 * 6. 페이로드 길이 4 byte
 * 7. 페이로드 bytes
 *
 * [통신 특징]
 * 1. 패킷 타입에 따라 핸들러로 구분
 * 2. 모든 서비스와 distributor는 공통된 패킷 파싱과 패킹을 수행
 * 3. 추후 packetType 앞에 목적지를 저장하여 구분하는 것도 방법
 */
const SERVICES_HEADER = {
  typeLength: 2,
  senderLength: 1,
  receiverLength: 1,
  payloadLength: 4,
};

export default SERVICES_HEADER;
