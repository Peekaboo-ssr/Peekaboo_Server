import {
  GLOBAL_FAIL_CODE,
  USER_STATE,
  GAME_SESSION_STATE,
} from '../constants/state.js';
import { createPacketS2G } from '../utils/packet/create.packet.js';
import { PACKET_TYPE } from '../constants/packet.js';

// 찾아 보니 이것들안쓰고 있네요

/**
 * 토큰이 유효하지 않을때 실패 응답 보내주는 함수입니다.
 * @param {*} socket
 */
export const invalidTokenResponse = (socket) => {
  const data = {
    gameId: null,
    hostId: null,
    existUserIds: null,
    ghostTypeIds: null, // 임시 고스트 타입
    globalFailCode: GLOBAL_FAIL_CODE.INVALID_REQUEST,
    userState: USER_STATE.STAY,
    gameSessionState: GAME_SESSION_STATE.PREPARE,
    message: '해당 토큰이 일치하지 않아 게임을 입장할 수 없습니다.',
  };
  const responseData = createPacketS2G(
    PACKET_TYPE.game.ConnectGameResponse,
    data,
    socket.sequence++,
  ); // sequence도 임시로
  socket.write(responseData);
};

/**
 * 호스트에게 게임 초기 정보를 응답으로 보내주는 함수입니다.
 * @param {*} socket
 * @param {*} game
 */
export const sendConnectGameResponse = (game, existUserIds, clientKey) => {
  // 이게 맞는거
  const ghosts = game.ghosts.map((ghost) => {
    const moveData = {
      position: ghost.position.getPosition(),
      rotation: ghost.rotation.getRotation(),
    };

    const ghostData = {
      ghostId: ghost.id,
      ghostTypeId: ghost.ghostTypeId,
      moveInfo: moveData,
    };
    return ghostData;
  });
  const data = {
    gameId: game.id,
    hostId: game.hostId,
    existUserIds: existUserIds,
    ghostInfos: ghosts,
    ghostTypeIds: [1, 1], // 임시 고스트 타입 5마리 소환하라고 보냅니다.
    globalFailCode: GLOBAL_FAIL_CODE.NONE,
    userState: USER_STATE.INGAME,
    gameSessionState: game.state,
    message: '게임 세션 입장에 성공하였습니다.',
  };
  const responseData = createPacketS2G(
    PACKET_TYPE.ConnectGameResponse,
    clientKey,
    data,
  ); // sequence도 임시로
  game.socket.write(responseData);
};
