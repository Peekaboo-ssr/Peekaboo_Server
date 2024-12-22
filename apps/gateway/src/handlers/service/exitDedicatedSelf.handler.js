import { deleteUserToDedicates } from '../../sessions/close.session';
import config from '@peekaboo-ssr/config/gateway';

export const exitDedicatedSelfHandler = (server, payload) => {
  console.log('exitDedicatedSelf.....');

  const { clientKey, gameSessionKey, gameSessionId } = payload;
  console.log('나가는 유저: ', clientKey);
  console.log('나가려는 데디 방: ', gameSessionKey);
  // 1. 해당 데디에서 삭제하도록 함
  deleteUserToDedicates(server, gameSessionKey, clientKey);

  // 세션 서비스에 등록 요청
  const pubMessage = {
    action: config.pubAction.JoinSessionRequest,
    type: 'user',
    clientKey,
    gameSessionId,
  };

  server.pubSubManager.sendMessage(config.subChannel.session, pubMessage);
};
