import config from '@peekaboo-ssr/config/lobby';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const enterLobbyHandler = async (socket, clientKey, payload, server) => {
  try {
    const { userId } = payload;
    console.log('enterLobby.............');

    const responseChannel = `enter_lobby_session_${clientKey}_${Date.now()}`;

    const messageForSession = {
      action: config.pubAction.JoinSessionRequest,
      responseChannel,
      type: 'lobby',
      clientKey,
      uuid: userId,
    };

    const response = await server.pubSubManager.sendAndWaitForResponse(
      config.subChannel.session,
      responseChannel,
      messageForSession,
    );
    const payloadDataForClient = {
      globalFailCode: null,
    };

    if (response.isSuccess) {
      payloadDataForClient.globalFailCode =
        config.clientState.globalFailCode.NONE;
      const packetForClient = createPacketS2G(
        config.clientPacket.lobby.EnterLobbyResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    } else if (!response.isSuccess) {
      payloadDataForClient.globalFailCode =
        config.clientState.globalFailCode.UNKNOWN_ERROR;
      const packetForClient = createPacketS2G(
        config.clientPacket.lobby.EnterLobbyResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    }
  } catch (e) {
    console.error('에러 발생: ', e.message);
  }
};
