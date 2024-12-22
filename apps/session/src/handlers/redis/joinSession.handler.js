import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { joinSessionByType } from '../../sessions/user.sessions.js';

export const joinSessionHandler = async (serverInstance, data) => {
  const { responseChannel, type } = data;
  const resMessage = {
    isSuccess: false,
    message: null,
  };

  try {
    // 만약 게임 세션에 참가할 예정이라면 gameSessionId, inviteCode만 추가
    if (type === 'game' && !serverInstance.gameSessions[data.gameUUID]) {
      // 만약 게임으로 이동한다면 로비 세션이었는지 확인
      // if (userSessions[userData.clientKey].type !== 'lobby') {
      //   console.log('로비>게임 비정상 접속 확인');
      //   throw new CustomError(errorCodesMap.INVALID_PACKET);
      // }
      serverInstance.gameSessions[data.gameUUID] = {
        inviteCode: data.inviteCode,
      };
    }

    // 만약 유저의 세션이 게임이었다면 게임 세션에서 numberOfPlayer 를 줄여준다.
    if (serverInstance.userSessions[data.clientKey].type === 'game') {
      serverInstance.gameSessions[data.gameSessionId].numberOfPlayer -= 1;
    }

    joinSessionByType(serverInstance.userSessions, data);

    if (responseChannel) {
      resMessage.isSuccess = true;
      serverInstance.pubSubManager.publisher.publish(
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

    serverInstance.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
    handleError(e);
  }
};
