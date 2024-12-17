import errorResponse from '@peekaboo-ssr/error/errorResponse';

class CustomError extends Error {
  constructor(error, packetType = null, clientKey = null, socket = null) {
    super(error.message);
    this.code = error.code;
    this.name = 'Custom Error';
    if (packetType) {
      this.responseData = errorResponse[packetType].payloadData;
      this.packetType = packetType;
      this.clientKey = clientKey;
      this.socket = socket;
    }
  }
}

export default CustomError;
