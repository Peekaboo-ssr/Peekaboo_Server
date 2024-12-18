import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import { joinSessionByType } from '../../sessions/user.sessions.js';

export const joinSessionHandler = async (serverInstance, data) => {
  const resMessage = {
    isSuccess: false,
  };

  try {
    const { responseChannel, type, clientKey, uuid } = data;
    const userData = {
      uuid,
      clientKey,
    };

    joinSessionByType(serverInstance.userSessions, type, userData);

    // 만약 게임 세션에 참가할 예정이라면 gameSessionId, inviteCode만 추가
    if (type === 'game' && !serverInstance.gameSessions[data.gameUUID]) {
      serverInstance.gameSessions[data.gameUUID] = {
        inviteCode: data.inviteCode,
      };
    }

    if (responseChannel) {
      resMessage.isSuccess = true;
      serverInstance.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    const resMessage = {
      isSuccess: false,
    };
    serverInstance.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
    handleError(e);
  }
};
