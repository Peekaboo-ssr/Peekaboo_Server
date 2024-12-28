import errorResponse from '@peekaboo-ssr/error/errorResponse';

class CustomError extends Error {
  constructor(error, packetType = null, clientKey = null, socket = null) {
    super(error.message);
    this.code = error.code;
    this.name = 'Custom Error';
    if (packetType) {
      const response = errorResponse?.[packetType]?.[this.code];
      if (response) {
        this.responseData = errorResponse[packetType][this.code].payloadData;
        this.packetType = packetType;
        this.clientKey = clientKey;
        this.socket = socket;
      } else {
        console.error('ErrorResponse 데이터가 올바르지 않습니다.', {
          packetType,
          code: this.code,
        });
      }
    }
  }
}

export default CustomError;
