import config from '@peekaboo-ssr/config/lobby';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import { rooms } from '../../../room/room.js';

// 대기룸 리스트 새로고침 핸들러
export const refreshLobbyHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  try {
    const { userId } = payload;
    console.log('refresh Lobby.............');

    const responseChannel = `find_exist_user_${clientKey}_${Date.now()}`;

    const messageForSession = {
      action: config.pubAction.FindUserRequest,
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
        globalFailCode: 0,
      };
      const packetForClient = createPacketS2G(
        config.clientPacket.lobby.RefreshListOfRoomResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    } else {
      //
      console.error('세션 확인 중 에러 발생!!');
    }
  } catch (e) {
    console.error('에러 발생: ', e.message);
  }
};
