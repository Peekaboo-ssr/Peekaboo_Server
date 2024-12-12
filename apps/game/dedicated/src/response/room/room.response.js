import { PACKET_TYPE } from '../../constants/packet.js';
import { GLOBAL_FAIL_CODE } from '../../constants/state.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

export const sendJoinRoomResponse = (socket, game, clientKey) => {
  const players = game.users.map((user) => {
    const userId = user.id;
    const moveInfo = {
      position: user.character.position.getPosition(),
      rotation: user.character.rotation.getRotation(),
    };
    const isHost = game.hostId === userId ? true : false;
    return {
      userId,
      moveInfo,
      isHost,
    };
  });
  const data = {
    globalFailCode: GLOBAL_FAIL_CODE.NONE,
    message: '방에 성공적으로 참가하였습니다.',
    gameSessionId: game.id,
    playerInfos: players,
  };

  const packet = createPacketS2G(
    PACKET_TYPE.game.JoinRoomResponse,
    clientKey,
    data,
  );

  socket.write(packet);
};
