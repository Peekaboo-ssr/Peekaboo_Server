import config from '@peekaboo-ssr/config/lobby';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const showWaitingRoomHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { userId } = payload;
    console.log('showWaitingRoomHandler.............');

    const messageForSession = {
      action: config.pubAction.WaitingRoomInfosRequest,
      clientKey,
    };

    await server.pubSubManager.sendMessage(
      config.subChannel.session,
      messageForSession,
    );
  } catch (e) {
    console.error('에러 발생: ', e.message);
  }
};
