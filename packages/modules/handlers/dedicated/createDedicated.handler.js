import config from '@peekaboo-ssr/config/shared';

export const createDedicatedHandler = (server, payload) => {
  console.log('createDedicated...');
  const { hostKey, dedicateKey, distributorKey, gameSessionId, inviteCode } =
    payload;

  // 게이트웨이의 데디맵에 유저를 추가함.
  server.mapClients.dedicates[dedicateKey].users.push(hostKey);

  // 게이트웨이의 데디맵에 dedicated의 distributorClientKey 추가함. (S2S 통신위함)
  server.mapClients.dedicates[dedicateKey].distributorKey = distributorKey;

  // 현재 연결된 유저맵에 gameSessionKey를 저장 (데디에 참여했는지 빠른 확인을 위함)
  server.connectClients[hostKey].gameSessionKey = dedicateKey;

  // 세션 서비스에 등록 요청
  const pubMessage = {
    action: config.pubAction.CreateDedicatedRequest,
    dedicateKey,
    distributorKey,
    gameSessionId,
    inviteCode,
    hostKey,
  };
  server.pubSubManager.sendMessage(config.subChannel.session, pubMessage);
};
