import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { joinSessionByType } from '../../sessions/user.sessions.js';

export const joinSessionHandler = async (serverInstance, data) => {
  const { responseChannel, type, clientKey, uuid } = data;
  const userData = {
    uuid,
    clientKey,
  };

  const resMessage = {
    isSuccess: false,
  };

  try {
    if (!serverInstance.userSessions[clientKey]) {
      throw new CustomError(Error);
    }

    joinSessionByType(serverInstance.userSessions, type, userData);

    if (responseChannel) {
      resMessage.isSuccess = true;
      serverInstance.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    console.log('에러 발생: ', e);
    const resMessage = {
      isSuccess: false,
    };
    serverInstance.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
  }
};
