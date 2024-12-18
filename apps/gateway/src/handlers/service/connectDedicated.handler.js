import config from '@peekaboo-ssr/config/shared';

export const connectDedicatedHandler = (server, payload) => {
  console.log('connectDedicated...');
  try {
    const { dedicateKey, clientKey, userId } = payload;

    // 게이트웨이의 데디맵에 유저를 추가함.
    server.mapClients.dedicates[dedicateKey].users.push(clientKey);
    console.log(
      '이거 게이트웨이 데디맵에 추가 후 유저 현황: ',
      server.mapClients.dedicates[dedicateKey].users,
    );

    // 현재 연결된 유저맵에 gameSessionKey를 저장 (데디에 참여했는지 빠른 확인을 위함)
    server.connectClients[clientKey].gameSessionKey = dedicateKey;
    console.log(
      '이거 게이트웨이 유저 커넥션 정보에 데디 추가 후 해당 유저 정보 게임 정보: ',
      server.connectClients[clientKey].gameSessionKey,
    );

    // 세션 서비스에 등록 요청
    const pubMessage = {
      action: config.pubAction.JoinSessionRequest,
      type: 'game',
      clientKey,
      uuid: userId,
    };

    server.pubSubManager.sendMessage(config.subChannel.session, pubMessage);
  } catch (e) {
    console.error(e);
  }
};
