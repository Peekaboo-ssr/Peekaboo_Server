import errorResponse from '@peekaboo-ssr/error/errorResponse';

class CustomError extends Error {
  constructor(error, packetType = null, clientKey = null) {
    super(error.message);
    this.code = error.code;
    this.errorResponse = errorResponse.packetType;
    this.packetType = packetType;
    this.clientKey = clientKey;
    this.name = 'Custom Error';
  }
}

export default CustomError;
