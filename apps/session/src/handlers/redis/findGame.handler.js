import {
  getGameByGameSessionId,
  getGameByInviteCode,
} from '../../sessions/game.session.js';

export const FindDedicateByInviteCodeHandler = async (server, data) => {
  const { responseChannel, inviteCode } = data;
  let resMessage = {
    isSuccess: false,
    dedicateKey: null,
  };
  try {
    const { dedicateKey, distributorKey } = getGameByInviteCode(
      server.gameSessions,
      inviteCode,
    );
    console.log(dedicateKey, distributorKey);
    console.log(responseChannel);

    if (!dedicateKey || !distributorKey) {
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    } else {
      resMessage.isSuccess = true;
      resMessage.dedicateKey = dedicateKey;
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};

export const FindDedicateByIdHandler = async (server, data) => {
  const { responseChannel, gameSessionId } = data;
  const resMessage = {
    isSuccess: false,
    dedicateKey: null,
  };
  try {
    const { dedicateKey, distributorKey } = getGameByGameSessionId(
      server.gameSessions,
      gameSessionId,
    );

    if (!dedicateKey || !distributorKey) {
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    } else {
      resMessage.isSuccess = true;
      resMessage.dedicateKey = dedicateKey;
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};
