import { v4 as uuidv4 } from 'uuid';
import { createDedicatedServer } from '../../../sessions/game.session.js';
import { getInviteCode } from '../../../utils/room/inviteCode.room.js';
import CustomError from '@peekaboo-ssr/error/CustomError';
import handleError from '@peekaboo-ssr/error/handleError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import config from '@peekaboo-ssr/config/game';

export const createRoomHandler = async (socket, clientKey, payload, server) => {
  try {
    const { userId, token } = payload;

    // 데디 데이터 세팅
    const gameUUID = uuidv4();
    const inviteCode = getInviteCode();

    // 로비 세션인지 확인
    const responseChannel = `find_user_${clientKey}_${Date.now()}`;
    const pubMessage = {
      action: config.pubAction.FindUserRequest,
      responseChannel,
      type: 'lobby',
      clientKey,
    };

    const response = await server.pubSubManager.sendAndWaitForResponse(
      config.subChannel.session,
      responseChannel,
      pubMessage,
    );

    if (response && response.isSuccess) {
      createDedicatedServer(gameUUID, clientKey, inviteCode, userId);
    } else {
      throw new CustomError(
        errorCodesMap.INVALID_PACKET,
        config.clientPacket.dedicated.CreateRoomResponse,
        clientKey,
        socket,
      );
    }
  } catch (e) {
    handleError(e);
  }
};
