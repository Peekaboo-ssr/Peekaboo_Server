import { PACKET_TYPE } from '../../constants/packet.js';
import { GLOBAL_FAIL_CODE } from '../../constants/state.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

export const itemGetResponse = (clientKey, socket, itemId, inventorySlot) => {
  const newPayload = {
    itemId,
    inventorySlot,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemGetResponse,
    clientKey,
    newPayload,
  );
  socket.write(packet);
};

export const itemUseResponse = (clientKey, socket, itemId, inventorySlot) => {
  const responsePayload = {
    itemId,
    inventorySlot,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemUseResponse,
    clientKey,
    responsePayload,
  );

  socket.write(packet);
};

export const itemDiscardResponse = (clientKey, socket, inventorySlot) => {
  const responsePayload = {
    inventorySlot,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemDiscardResponse,
    clientKey,
    responsePayload,
  );

  socket.write(packet);
};

export const itemPurchaseResponse = (clientKey, socket, isPurchaseSuccess) => {
  const responsePayload = {
    globalFailCode: isPurchaseSuccess
      ? GLOBAL_FAIL_CODE.NONE
      : GLOBAL_FAIL_CODE.INVALID_REQUEST,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemPurchaseResponse,
    clientKey,
    responsePayload,
  );

  socket.write(packet);
};

// export const sendJoinRoomResponse = (server, clientKey, isSuccess) => {
//   const players = isSuccess
//     ? server.game.users.map((user) => {
//         const userId = user.id;
//         const moveInfo = {
//           position: user.character.position.getPosition(),
//           rotation: user.character.rotation.getRotation(),
//         };
//         const isHost = server.game.hostId === userId ? true : false;
//         return {
//           userId,
//           moveInfo,
//           isHost,
//         };
//       })
//     : [];

//   const data = {
//     globalFailCode: isSuccess
//       ? GLOBAL_FAIL_CODE.NONE
//       : GLOBAL_FAIL_CODE.INVALID_REQUEST,
//     message: isSuccess
//       ? '방에 성공적으로 참가하였습니다.'
//       : `방 참가에 실패하였습니다.`,
//     gameSessionId: isSuccess ? server.game.id : '',
//     playerInfos: players,
//   };

//   const packet = createPacketS2G(
//     PACKET_TYPE.server.game.JoinRoomResponse,
//     clientKey,
//     data,
//   );

//   server.game.socket.write(packet);
// };
