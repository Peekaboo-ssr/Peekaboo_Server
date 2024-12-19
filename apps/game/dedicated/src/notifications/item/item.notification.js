import config from '@peekaboo-ssr/config/game';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';

export const itemChangeNotification = (game, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };
  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.ItemChangeNotification,
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
    if (user.id !== userId) {
      const packet = createPacketS2G(
        config.clientPacket.dedicated.ItemUseNotification,
        user.clientKey,
        payload,
      );
      game.socket.write(packet);
    }
  });
};

export const itemDiscardNotification = (game, userId, itemId) => {
  const item = game.getItem(itemId);

  item.mapOn = true;

  const payload = {
    userId,
    itemId,
  };

  game.users.forEach((user) => {
    if (userId !== user.id) {
      const packet = createPacketS2G(
        config.clientPacket.dedicated.ItemDiscardNotification,
        user.clientKey,
        payload,
      );
      game.socket.write(packet);
    }
  });
};

export const itemDeleteNotification = (game, itemIds) => {
  const payload = {
    itemIds,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.ItemDeleteNotification,
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
      config.clientPacket.dedicated.ItemDisuseNotification,
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
      config.clientPacket.dedicated.ItemCreateNotification,
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
        config.clientPacket.dedicated.ItemGetNotification,
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
    soulCredit: game.soulCredit,
  };

  game.users.forEach((user) => {
    const packet = createPacketS2G(
      config.clientPacket.dedicated.ItemPurchaseNotification,
      user.clientKey,
      payload,
    );

    game.socket.write(packet);
  });
};
