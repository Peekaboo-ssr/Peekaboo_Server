import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

const handleError = (error) => {
  let responseCode;
  let message;
  if (error.code) {
    responseCode = error.code;
    message = error.message;
    console.error(`에러코드: ${responseCode}, 메세지: ${message}`);
  } else {
    responseCode = errorCodesMap.SOCKET_ERROR.code;
    message = error.message;
    console.error(`불분명 에러: ${message}`);
  }

  // 패킷타입이 있다면 실패 응답도 수행
  if (error.packetType) {
    const payload = error.responseData;
    const packet = createPacketS2G(error.packetType, error.clientKey, payload);
    error.socket.write(packet);
  }
};

export default handleError;
