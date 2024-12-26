import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { joinSessionByType } from '../../sessions/user.sessions.js';

export const joinSessionHandler = async (server, data) => {
  const { responseChannel, type } = data;
  const resMessage = {
    isSuccess: false,
    message: null,
  };

  try {
    if (!data.clientKey || !type) {
      console.error('Invalid clientKey or type');
    }

    // 만약 유저의 세션이 게임이었다면 게임 세션에서 numberOfPlayer 를 줄여준다.
    const userSession = server.userSessions[data.clientKey];
    if (userSession && userSession.type === 'game') {
      server.gameSessions[data.gameSessionId].numberOfPlayer -= 1;
    }

    joinSessionByType(server.userSessions, data);

    if (responseChannel) {
      resMessage.isSuccess = true;
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    if (e.code === errorCodesMap.DUPLICATED_USER_CONNECT.code) {
      resMessage.message = 'duplicated';
    } else {
      resMessage.message = 'ERROR';
    }

    server.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
    handleError(e);
  }
};
