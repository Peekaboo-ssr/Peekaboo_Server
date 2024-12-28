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

export const sendJoinRoomResponse = (game, clientKey, userId) => {
  const players = game.users.map((user) => {
    if (user.id !== userId) {
      const userId = user.id;
      const nickname = user.nickname;
      const moveInfo = {
        position: user.character.position.getPosition(),
        rotation: user.character.rotation.getRotation(),
      };
      const isHost = game.hostId === userId;
      return {
        userId,
        nickname,
        moveInfo,
        isHost,
      };
    }
  });

  const payload = {
    globalFailCode: config.clientState.globalFailCode.NONE,
    message: '방에 성공적으로 참가하였습니다.',
    gameSessionId: game.id,
    playerInfos: players,
  };

  const packet = createPacketS2G(
    config.clientPacket.dedicated.JoinRoomResponse,
    clientKey,
    payload,
  );

  game.socket.write(packet);
};
