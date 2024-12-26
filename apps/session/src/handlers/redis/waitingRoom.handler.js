import config from '@peekaboo-ssr/config/lobby';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const waitingRoomResponse = (serverInstance, data) => {
  const { clientKey } = data;

  let roomInfos = [];

  const payloadDataForClient = {
    roomInfos,
    globalFailCode: config.clientState.globalFailCode.UNKNOWN_ERROR,
  };

  try {
    for (const [key, value] of Object.entries(serverInstance.gameSessions)) {
      // 대기중인 방만 추가
      if (value.state === config.clientState.gameState.PREPARE) {
        const roomInfo = {
          gameSessionId: key,
          roomName: 'TEST_ROOM',
          numberOfPlayer: value.numberOfPlayer,
          latency: value.latency,
        };
        roomInfos.push(roomInfo);
      }
    }

    payloadDataForClient.globalFailCode =
      config.clientState.globalFailCode.NONE;

    const packetForClient = createPacketS2G(
      config.clientPacket.lobby.WaitingRoomListResponse,
      clientKey,
      payloadDataForClient,
    );

    serverInstance.gateSocket.write(packetForClient);
  } catch (e) {
    payloadDataForClient.globalFailCode =
      config.clientState.globalFailCode.UNKNOWN_ERROR;
    const packetForClient = createPacketS2G(
      config.clientPacket.lobby.WaitingRoomListResponse,
      clientKey,
      payloadDataForClient,
    );

    serverInstance.gateSocket.write(packetForClient);
  }
};
