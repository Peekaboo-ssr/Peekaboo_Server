import { PACKET_TYPE } from '../../constants/packet.js';
import { GLOBAL_FAIL_CODE } from '../../constants/state.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { joinRoomNotification } from '../../notifications/room/room.notification.js';

export const sendJoinRoomResponse = (game, clientKey, isSuccess) => {
  const players = isSuccess
    ? game.users.map((user) => {
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
      })
    : [];

  const data = {
    globalFailCode: isSuccess
      ? GLOBAL_FAIL_CODE.NONE
      : GLOBAL_FAIL_CODE.INVALID_REQUEST,
    message: isSuccess
      ? '방에 성공적으로 참가하였습니다.'
      : `방 참가에 실패하였습니다.`,
    gameSessionId: isSuccess ? game.id : '',
    playerInfos: players,
  };

  const packet = createPacketS2G(
    PACKET_TYPE.game.JoinRoomResponse,
    clientKey,
    data,
  );

  game.socket.write(packet);
};
