import { createPacketS2G } from '../../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../../constants/packet.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';

export const itemChangeNotification = (gameSession, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };
  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemChangeNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

export const itemUseNotification = (gameSession, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemUseNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

export const itemDiscardNotification = (gameSession, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemDiscardNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

export const itemDeleteNotification = (gameSession, itemId) => {
  const delItem = gameSession.removeItem(itemId);
  if (delItem === -1) {
    throw new CustomError(ErrorCodesMaps.ITEM_DETERIORATION);
  }

  //아이템 위변조가 일어나도 일단은 보내는걸로
  const payload = {
    itemId,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemDeleteNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};

export const itemDisuseNotification = (gameSession, userId, itemId) => {
  const payload = {
    userId,
    itemId,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemDisuseNotification,
      payload,
      user.socket.sequence++,
    );
    user.socket.write(packet);
  });
};
export const itemCreateNotification = (gameSession, itemInfo) => {
  const payload = {
    itemInfo,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemCreateNotification,
      payload,
      user.socket.sequence++,
    );

    user.socket.write(packet);
  });
};

export const itemGetNotification = (gameSession, itemId, userId) => {
  gameSession.users.forEach((user) => {
    if (user.id !== userId) {
      const packet = createPacketS2G(
        PACKET_TYPE.game.ItemGetNotification,
        {
          itemId,
          userId,
        },
        user.socket.sequence++,
      );

      user.socket.write(packet);
    }
  });
};

export const itemPurchaseNotification = (gameSession, itemInfo) => {
  const payload = {
    itemInfo,
  };

  gameSession.users.forEach((user) => {
    const packet = createPacketS2G(
      PACKET_TYPE.game.ItemPurchaseNotification,
      payload,
      user.socket.sequence++,
    );

    user.socket.write(packet);
  });
};
