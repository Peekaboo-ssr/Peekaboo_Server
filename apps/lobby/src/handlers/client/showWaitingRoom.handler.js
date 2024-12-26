import config from '@peekaboo-ssr/config/lobby';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const showWaitingRoomHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { userId } = payload;
  console.log('showWaitingRoomHandler.............');
  try {
    const responseChannel = `get_waiting_room_${clientKey}_${Date.now()}`;
    const messageForSession = {
      action: config.pubAction.WaitingRoomInfosRequest,
      responseChannel,
      clientKey,
    };

    const response = await server.pubSubManager.sendAndWaitForResponse(
      config.subChannel.session,
      responseChannel,
      messageForSession,
    );

    if (response && response.isSuccess) {
      payloadDataForClient.globalFailCode =
        config.clientState.globalFailCode.NONE;

      const packetForClient = createPacketS2G(
        config.clientPacket.lobby.WaitingRoomListResponse,
        clientKey,
        payloadDataForClient,
      );

      server.gateSocket.write(packetForClient);
    } else {
      throw new CustomError(
        errorCodesMap.HANDLER_ERROR,
        config.clientPacket.lobby.WaitingRoomListResponse,
        socket,
      );
    }
  } catch (e) {
    handleError(e);
  }
};
