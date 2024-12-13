import { sendCreateRoomResponse } from '../../response/room/createRoom.response.js';
import { v4 as uuidv4 } from 'uuid';
import { createDedicatedServer } from '../../sessions/game.session.js';
import { getInviteCode } from '../../utils/room/inviteCode.room.js';
import config from '@peekaboo-ssr/config/game';

export const createRoomHandler = async (socket, clientKey, payload, server) => {
  try {
    const { userId, token } = payload;

    // ------------ TODO: token 검증 ---------------

    // --------------------------- 데디 작업 ---------------------------------
    const gameUUID = uuidv4();
    const inviteCode = getInviteCode();
    createDedicatedServer(gameUUID, clientKey, inviteCode, userId);

    // createRoomResponse를 보내준다.
    console.log(`----------- createRoom Complete : ${gameUUID} -----------`);
    await sendCreateRoomResponse(socket, clientKey, gameUUID, inviteCode);
  } catch (e) {
    console.error(e);
  }
};
