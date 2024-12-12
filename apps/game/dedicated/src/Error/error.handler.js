import { ErrorCodesMaps } from './error.codes.js';

export const handleError = (error) => {
  let responseCode;
  let message;
  if (error.code) {
    responseCode = error.code;
    message = error.message;
    console.error(`에러코드: ${responseCode}, 메세지: ${message}`);
  } else {
    responseCode = ErrorCodesMaps.SOCKET_ERROR.code;
    message = error.message;
    console.error(`불분명 에러: ${message}`);
  }
};
