import {
  getGameByGameSessionId,
  getGameByInviteCode,
} from '../../sessions/game.session.js';

export const FindDedicateByInviteCodeHandler = async (serverInstance, data) => {
  try {
    const { responseChannel, inviteCode } = data;

    const resMessage = {
      isSuccess: false,
      dedicateKey: null,
      distributorKey: null,
    };

    const { dedicateKey, distributorKey } = getGameByInviteCode(inviteCode);
    console.log(dedicateKey, distributorKey);

    if (!dedicateKey || !distributorKey) {
      serverInstance.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    } else {
      resMessage.isSuccess = true;
      resMessage.dedicateKey = dedicateKey;
      resMessage.distributorKey = distributorKey;
      serverInstance.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};

export const FindDedicateByIdHandler = async (serverInstance, data) => {
  try {
    const { responseChannel, gameSessionId } = data;
    const resMessage = {
      isSuccess: false,
      dedicateKey: null,
      distributorKey: null,
    };

    const { dedicateKey, distributorKey } =
      getGameByGameSessionId(gameSessionId);

    if (!dedicateKey || !distributorKey) {
      serverInstance.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    } else {
      resMessage.isSuccess = true;
      resMessage.dedicateKey = dedicateKey;
      resMessage.distributorKey = distributorKey;
      serverInstance.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    console.log('에러 발생: ', e);
  }
};
