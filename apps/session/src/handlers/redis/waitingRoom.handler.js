import config from '@peekaboo-ssr/config/lobby';
import handleError from '@peekaboo-ssr/error/handleError';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const waitingRoomHandler = (server, data) => {
  const { responseChannel, clientKey } = data;
  const resMessage = {
    isSuccess: false,
    roomInfos: [],
    message: null,
  };

  try {
    for (const [key, value] of Object.entries(server.gameSessions)) {
      // 대기중인 방만 추가
      if (value.state === config.clientState.gameState.PREPARE) {
        const roomInfo = {
          gameSessionId: key,
          roomName: value.roomName,
          numberOfPlayer: value.numberOfPlayer,
          latency: value.latency,
        };
        resMessage.roomInfos.push(roomInfo);
      }
    }

    if (responseChannel) {
      resMessage.isSuccess = true;
      server.pubSubManager.publisher.publish(
        responseChannel,
        JSON.stringify(resMessage),
      );
    }
  } catch (e) {
    server.pubSubManager.publisher.publish(
      responseChannel,
      JSON.stringify(resMessage),
    );
    handleError(e);
  }
};
