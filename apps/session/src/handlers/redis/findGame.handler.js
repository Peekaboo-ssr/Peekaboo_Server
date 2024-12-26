import {
  getGameByGameSessionId,
  getGameByInviteCode,
} from '../../sessions/game.session.js';

export const FindDedicateByInviteCodeHandler = async (server, data) => {
  const { responseChannel, inviteCode } = data;
  try {
    const resMessage = {
      isSuccess: false,
      dedicateKey: null,
      distributorKey: null,
    };

    const { dedicateKey, distributorKey } = getGameByInviteCode(
      server.gameSessions,
      inviteCode,
    );
    // console.log(dedicateKey, distributorKey);

    if (!dedicateKey || !distributorKey) {
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    } else {
      resMessage.isSuccess = true;
      resMessage.dedicateKey = dedicateKey;
      resMessage.distributorKey = distributorKey;
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
  try {
    const { responseChannel, gameSessionId } = data;
    const resMessage = {
      isSuccess: false,
      dedicateKey: null,
      distributorKey: null,
    };

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
      resMessage.distributorKey = distributorKey;
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};
