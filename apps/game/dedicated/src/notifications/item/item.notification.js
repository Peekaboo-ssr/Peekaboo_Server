import { PACKET_TYPE } from '../../constants/packet.js';
import { createPacketS2G } from '../../utils/packet/create.packet.js';

export const itemChangeNotification = (game, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemChangeNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const itemUseNotification = (game, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemUseNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const itemDiscardNotification = (game, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemDiscardNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const itemDeleteNotification = (game, itemIds) => {
  const payload = {
    itemIds,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemDeleteNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};

export const itemDisuseNotification = (game, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemDisuseNotification,
      user.clientKey,
      payload,
    );
    game.socket.write(packet);
  });
};
export const itemCreateNotification = (game, itemInfo) => {
  const payload = {
    itemInfo,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemCreateNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};

export const itemGetNotification = (game, itemId, userId) => {
  const payload = {
    itemId,
    userId,
  };

  game.users.forEach((user) => {
    if (user.id !== userId) {
      const packet = createPacketS2G(
        PACKET_TYPE.ItemGetNotification,
        user.clientKey,
        payload,
      );
      game.socket.write(packet);
    }
  });
};

export const itemPurchaseNotification = (game, itemInfo) => {
  const payload = {
    itemInfo,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.ItemPurchaseNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};
