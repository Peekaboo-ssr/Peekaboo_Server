import { deleteUserToDedicates } from '../../sessions/close.session';
import config from '@peekaboo-ssr/config/gateway';

export const exitDedicatedSelfHandler = (server, payload) => {
  console.log('exitDedicatedSelf.....');
  const { clientKey, dedicateKey, gameSessionId } = payload;
  try {
    console.log('나가는 유저: ', clientKey);
    console.log('나가려는 데디 방: ', dedicateKey);
    // 1. 해당 데디에서 삭제하도록 함
    deleteUserToDedicates(server, dedicateKey, clientKey);

    // 세션 서비스에 등록 요청
    const pubMessage = {
      action: config.pubAction.JoinSessionRequest,
      type: 'user',
      clientKey,
      gameSessionId,
    };

    server.pubSubManager.sendMessage(config.subChannel.session, pubMessage);
  } catch (e) {
    console.error(e);
  }
};
