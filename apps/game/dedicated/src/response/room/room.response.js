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
      globalFailCode: config.clientState.globalFailCode.NONE,
      message: '방이 성공적으로 생성되었습니다.',
      gameSessionId: gameId,
      inviteCode,
    };

    const packet = createPacketS2G(
      config.clientPacket.dedicated.CreateRoomResponse,
      clientKey,
      payloadData,
    );

    socket.write(packet);
  } catch (e) {
    console.error(e);
  }
};

export const sendJoinRoomResponse = (game, clientKey, isSuccess) => {
  const players = isSuccess
    ? game.users.map((user) => {
        const userId = user.id;
        const nickname = user.nickname;
        const moveInfo = {
          position: user.character.position.getPosition(),
          rotation: user.character.rotation.getRotation(),
        };
        const isHost = game.hostId === userId ? true : false;
        return {
          userId,
          nickname,
          moveInfo,
          isHost,
        };
      })
    : [];

  const data = {
    globalFailCode: isSuccess
      ? config.clientState.globalFailCode.NONE
      : config.clientState.globalFailCode.INVALID_REQUEST,
    message: isSuccess
      ? '방에 성공적으로 참가하였습니다.'
      : `방 참가에 실패하였습니다.`,
    gameSessionId: isSuccess ? game.id : '',
    playerInfos: players,
  };

  const packet = createPacketS2G(
    config.clientPacket.dedicated.JoinRoomResponse,
    clientKey,
    data,
  );

  game.socket.write(packet);
};
