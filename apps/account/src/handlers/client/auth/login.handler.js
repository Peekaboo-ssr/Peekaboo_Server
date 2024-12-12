import config from '@peekaboo-ssr/config/account';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import databaseManager from '@peekaboo-ssr/classes/DatabaseManager';
import userCommands from '@peekaboo-ssr/commands/userCommands';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export const loginRequestHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { id, password } = payload;
  try {
    // DB 검증, ID / PASSWORD 검증
    const user = await userCommands.findUser(databaseManager, id);

    if (!user || user.password !== password) {
      const payloadData = {
        globalFailCode: 3,
        userId: 'none',
        token: 'none',
      };
      const packet = createPacketS2G(
        config.clientPacket.account.LoginResponse,
        clientKey,
        payloadData,
      );
      socket.write(packet);
      throw new Error(`비밀번호가 맞지 않습니다.`);
    }
    // 나중에는 bcrypt 검증으로 강화 - 회원가입 기능 추가시 TODO
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if(!isPasswordValid){
    //   throw new Error(`비밀번호가 맞지 않습니다.`);
    // }

    // UUID DB에 있는지 검증 후 발급
    const userId = !user.uuid
      ? await userCommands.createUserUuid(databaseManager, id, uuidv4())
      : user.uuid;

    // JWT 토큰 발급
    const token = jwt.sign({ id }, config.jwt.key, {
      expiresIn: config.jwt.expiresIn,
    });

    const payloadDataForClient = {
      globalFailCode: 0,
      userId,
      token,
    };

    // 세션등록 Pub
    const responseChannel = `join_session_${clientKey}_${Date.now()}`;
    const pubMessage = {
      action: config.pubAction.JoinSessionRequest,
      responseChannel,
      type: 'user',
      clientKey,
      uuid: userId,
    };

    const response = await server.pubSubManager.sendAndWaitForResponse(
      config.subChannel.session,
      responseChannel,
      pubMessage,
    );

    if (response.isSuccess) {
      // 세션 등록 요청을 하고 클라에게 응답 전달
      const packetForClient = createPacketS2G(
        config.clientPacket.account.LoginResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    } else {
      payloadDataForClient.globalFailCode = 3;
      const packetForClient = createPacketS2G(
        config.clientPacket.account.LoginResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    }
  } catch (e) {
    console.error(e);
  }
};
