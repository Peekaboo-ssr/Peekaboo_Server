export const getSocketByClientKey = (connection, clientKey) => {
  try {
    const socket = connection[clientKey].socket;

    if (!socket) {
      return null;
    }

    return socket;
  } catch (e) {
    console.error(e);
  }
};

export const getDedicateKeyByClientKey = (connection, clientKey) => {
  try {
    const dedicateKey = connection[clientKey].gameSessionKey;

    if (!dedicateKey) {
      throw new Error('해당 유저는 참여한 게임이 없습니다!');
    }
    return dedicateKey;
  } catch (e) {
    console.error(e);
  }
};
