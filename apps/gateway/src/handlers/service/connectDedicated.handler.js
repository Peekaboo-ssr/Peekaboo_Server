import config from '@peekaboo-ssr/config/shared';

export const connectDedicatedHandler = (server, payload) => {
  console.log('connectDedicated...');
  const { dedicateKey, clientKey, userId } = payload;

  // 게이트웨이의 데디맵에 유저를 추가함.
  server.mapClients.dedicates[dedicateKey].users.push(clientKey);

  // 현재 연결된 유저맵에 gameSessionKey를 저장 (데디에 참여했는지 빠른 확인을 위함)
  server.connectClients[clientKey].gameSessionKey = dedicateKey;

  // 세션 서비스에 등록 요청
  const pubMessage = {
    action: config.pubAction.JoinSessionRequest,
    type: 'game',
    clientKey,
    uuid: userId,
  };

  server.pubSubManager.sendMessage(config.subChannel.session, pubMessage);
};
