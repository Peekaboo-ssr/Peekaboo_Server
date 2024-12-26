import config from '@peekaboo-ssr/config/lobby';
import databaseManager from '@peekaboo-ssr/classes/DatabaseManager';
import userCommands from '@peekaboo-ssr/commands/userCommands';
import handleError from '@peekaboo-ssr/error/handleError';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

// 닉네임 추가가 된다면 진행
export const changeNicknameHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { userId, nickname, token } = payload;

  try {
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
      // 닉네임 변경
      await userCommands.updateUserNickname(databaseManager, userId, nickname);
      const payload = {
        globalFailCode: config.clientState.globalFailCode.NONE,
        message: '닉네임이 정상적으로 변경되었습니다.',
      };
      const packet = createPacketS2G(
        config.clientPacket.lobby.ChangeNicknameResponse,
        clientKey,
        payload,
      );
      socket.write(packet);
    } else {
      throw new CustomError(
        errorCodesMap.HANDLER_ERROR,
        config.clientPacket.lobby.ChangeNicknameResponse,
        socket,
      );
    }
  } catch (e) {
    handleError(e);
  }

  // 유저의 닉네임 업데이트
  await userCommands.updateUserNickname(databaseManager);
};
