import config from '@peekaboo-ssr/config/account';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import databaseManager from '@peekaboo-ssr/classes/DatabaseManager';
import userCommands from '@peekaboo-ssr/commands/userCommands';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';
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
    // DB 검증
    const user = await userCommands.findUser(databaseManager, id);

    if (!user) {
      throw new CustomError(
        errorCodesMap.AUTHENTICATION_ERROR,
        config.clientPacket.account.LoginResponse,
        clientKey,
        socket,
      );
    }

    // 패스워드 bcrypt 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(
        errorCodesMap.AUTHENTICATION_ERROR,
        config.clientPacket.account.LoginResponse,
        clientKey,
        socket,
      );
    }

    // 마지막 유저 로그인 업데이트
    await userCommands.updateUserLogin(databaseManager, id);

    // UUID DB에 있는지 검증 후 발급
    const userId = !user.uuid
      ? await userCommands.createUserUuid(databaseManager, id, uuidv4())
      : user.uuid;

    // JWT 토큰 발급
    const token = jwt.sign({ id }, config.jwt.key, {
      expiresIn: config.jwt.expiresIn,
    });

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
      const payloadDataForClient = {
        globalFailCode: 0,
        userId,
        token,
      };
      const packetForClient = createPacketS2G(
        config.clientPacket.account.LoginResponse,
        clientKey,
        payloadDataForClient,
      );
      socket.write(packetForClient);
    } else if (!response.isSuccess) {
      if (response.message === 'duplicated') {
        throw new CustomError(
          errorCodesMap.DUPLICATED_USER,
          config.clientPacket.account.LoginResponse,
          clientKey,
          socket,
        );
      } else {
        throw new CustomError(
          errorCodesMap.AUTHENTICATION_ERROR,
          config.clientPacket.account.LoginResponse,
          clientKey,
          socket,
        );
      }
    }
  } catch (e) {
    handleError(e);
  }
};
