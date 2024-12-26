import config from '@peekaboo-ssr/config/gateway';
import handleError from '@peekaboo-ssr/error/handleError';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';

export const createDedicatedHandler = (server, payload) => {
  try {
    console.log('createDedicated...');
    const { hostKey, dedicateKey, distributorKey, gameSessionId, inviteCode } =
      payload;

    console.log('새로 생성된 방 정보: ', payload);

    // 게이트웨이의 데디맵에 유저를 추가함.
    server.mapClients.dedicates[dedicateKey].users.push(hostKey);

    // 게이트웨이의 데디맵에 dedicated의 distributorClientKey 추가함.
    server.mapClients.dedicates[dedicateKey].distributorKey = distributorKey;

    // 현재 연결된 유저맵에 gameSessionId를 저장 (데디에 참여했는지 빠른 확인을 위함)
    server.connectClients[hostKey].gameSessionId = gameSessionId;

    console.log(
      'Dedicate mapClient에 추가: ',
      server.mapClients.dedicates[dedicateKey],
    );

    // 세션 서비스에 등록 요청 S2S
    const s2sPacket = createPacketS2S(
      config.servicePacket.CreateDedicatedRequest,
      'gateway',
      'session',
      {
        hostKey,
        dedicateKey,
        distributorKey,
        gameSessionId,
        inviteCode,
      },
    );

    server.clientToDistributor.write(s2sPacket);

    // const pubMessage = {
    //   action: config.pubAction.CreateDedicatedRequest,
    //   dedicateKey,
    //   distributorKey,
    //   gameSessionId,
    // };
    // server.pubSubManager.sendMessage(config.subChannel.session, pubMessage);
  } catch (e) {
    handleError(e);
  }
};
