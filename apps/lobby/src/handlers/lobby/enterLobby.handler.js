import config from '@peekaboo-ssr/config/lobby';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import { rooms } from '../../../room/room.js';

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

    if (response.isSuccess) {
      const roomInfos = rooms.map((room) => {
        const roomInfo = {
          gameSessionId: room.gameSessionId,
          roomName: room.roomName,
          numberOfPlayer: room.users.length,
        };
        return roomInfo;
      });
      const payloadDataForClient = {
        roomInfos,
      };
      const packetForClient = createPacketS2G(
        config.clientPacket.lobby.EnterLobbyResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    } else {
      console.error('세션 등록 중 에러 발생!!');
    }
  } catch (e) {
    console.error('에러 발생: ', e.message);
  }
};
