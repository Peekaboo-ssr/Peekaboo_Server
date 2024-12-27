import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
import config from '@peekaboo-ssr/config/game';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import userCommands from '@peekaboo-ssr/commands/userCommands';
import DatabaseManager from '@peekaboo-ssr/classes/DatabaseManager';

export const JoinRoomByInviteCodeHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { userId, inviteCode, token } = payload;
  console.log('joinRoomInviteCode.....');
  try {
    // 닉네임 불러오기
    const user = await userCommands.findUserByUUID(DatabaseManager, userId);

    if (!user) {
      throw new CustomError(
        errorCodesMap.USER_NOT_FOUND,
        config.clientPacket.game.JoinRoomResponse,
        clientKey,
        socket,
      );
    }
    // TODO : 토큰 검증

    // 일단 inviteCode로 게임을 찾음
    const responseChannel = `find_game_${clientKey}_${Date.now()}`;
    const pubMessage = {
      action: config.pubAction.FindDedicateByInviteCodeRequest,
      responseChannel,
      inviteCode,
    };

    const response = await server.pubSubManager.sendAndWaitForResponse(
      config.subChannel.session,
      responseChannel,
      pubMessage,
    );

    console.log('참여할 데디 키: ', response.dedicateKey);

    if (response.isSuccess) {
      console.log('이거 pubsub으로 받은 dedicateKey: ', response.dedicateKey);
      // 데디케이티드에 해당 유저 추가 요청
      const packetForDedicate = createPacketS2S(
        config.servicePacket.JoinDedicatedRequest,
        'game',
        response.dedicateKey,
        { clientKey, userId, nickname: user.nickname },
      );

      server.clientToDistributor.write(packetForDedicate);
    } else {
      throw new CustomError(
        errorCodesMap.GAME_NOT_FOUND,
        config.clientPacket.game.JoinRoomResponse,
        clientKey,
        socket,
      );
    }

    console.log(
      `----------- join Dedicate Request Complete : ${userId} -----------`,
    );
  } catch (e) {
    handleError(e);
  }
};
