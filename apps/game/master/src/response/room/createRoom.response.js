import config from '@peekaboo-ssr/config/game';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

/**
 * 토큰이 유효하지 않을때 실패 응답 보내주는 함수입니다.
 * @param {*} socket
 */
export const sendCreateRoomResponse = async (
  socket,
  clientKey,
  gameId,
  inviteCode,
) => {
  try {
    const payloadData = {
      globalFailCode: config.globalFailCode.NONE,
      message: '방이 성공적으로 생성되었습니다.',
      gameSessionId: gameId,
      inviteCode, // 임시 고스트 타입
    };
    const packet = createPacketS2G(
      config.clientPacket.game.CreateRoomResponse,
      clientKey,
      payloadData,
    );

    socket.write(packet);
  } catch (e) {
    console.error(e);
  }
};
