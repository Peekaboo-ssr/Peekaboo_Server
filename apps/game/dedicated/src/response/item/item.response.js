import config from '@peekaboo-ssr/config/game';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const itemGetResponse = (clientKey, socket, itemId, inventorySlot) => {
  const newPayload = {
    itemId,
    inventorySlot,
  };
  const packet = createPacketS2G(
    config.clientPacket.dedicated.ItemGetResponse,
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
    config.clientPacket.dedicated.ItemUseResponse,
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
    config.clientPacket.dedicated.ItemDiscardResponse,
    clientKey,
    responsePayload,
  );

  socket.write(packet);
};

export const itemPurchaseResponse = (clientKey, socket, isPurchaseSuccess) => {
  const responsePayload = {
    globalFailCode: isPurchaseSuccess
      ? config.clientState.globalFailCode.NONE
      : config.clientState.globalFailCode.INVALID_REQUEST,
  };
  const packet = createPacketS2G(
    config.clientPacket.dedicated.ItemPurchaseResponse,
    clientKey,
    responsePayload,
  );

  socket.write(packet);
};
