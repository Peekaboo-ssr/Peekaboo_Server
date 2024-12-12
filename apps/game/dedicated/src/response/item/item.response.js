import { PACKET_TYPE } from '../../constants/packet.js';
import { GLOBAL_FAIL_CODE } from '../../constants/state.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

export const itemGetResponse = (socket, itemId, inventorySlot) => {
  const newPayload = {
    itemId,
    inventorySlot,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemGetResponse,
    newPayload,
    socket.sequence++,
  );
  socket.write(packet);
};

export const itemUseResponse = (socket, itemId, inventorySlot) => {
  const responsePayload = {
    itemId,
    inventorySlot,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemUseResponse,
    responsePayload,
    socket.sequence++,
  );

  socket.write(packet);
};

export const itemDiscardResponse = (socket, inventorySlot) => {
  const responsePayload = {
    inventorySlot,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemDiscardResponse,
    responsePayload,
    socket.sequence++,
  );

  socket.write(packet);
};

export const itemPurchaseResponse = (socket, isPurchaseSuccess) => {
  const responsePayload = {
    globalFailCode: isPurchaseSuccess
      ? GLOBAL_FAIL_CODE.NONE
      : GLOBAL_FAIL_CODE.INVALID_REQUEST,
  };
  const packet = createPacketS2G(
    PACKET_TYPE.game.ItemPurchaseResponse,
    responsePayload,
    socket.sequence++,
  );

  socket.write(packet);
};
