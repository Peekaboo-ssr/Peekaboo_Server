// 방 정보를 갱신하는 핸들러
export const updateRoomInfoHandler = (server, payload) => {
  try {
    console.log('payload: ', payload);
    const { gameSessionId, numberOfPlayer, latency, gameSessionState } =
      payload;

    server.gameSessions[gameSessionId].numberOfPlayer = numberOfPlayer;
    server.gameSessions[gameSessionId].latency = latency;
    server.gameSessions[gameSessionId].state = gameSessionState;
  } catch (e) {
    console.error(e);
  }
};
