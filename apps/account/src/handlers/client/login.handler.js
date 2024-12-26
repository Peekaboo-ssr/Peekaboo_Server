import config from '@peekaboo-ssr/config/account';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import DatabaseManager from '@peekaboo-ssr/classes/DatabaseManager';
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
    console.log(id, password);
    // DB 검증
    const user = await userCommands.findUser(DatabaseManager, id);
    console.log(user);
    if (!user) {
      throw new CustomError(
        errorCodesMap.AUTHENTICATION_ERROR,
        config.clientPacket.account.LoginResponse,
        clientKey,
        socket,
      );
    }

    // 패스워드 bcrypt 검증 이거 왜 안되는지 진짜 모르겠음 회원가입 일단 두번 보내는거 없애보고 테스트 필요함 하.. 화나네
    // if (!(await bcrypt.compare(password, user.password))) {
    //   throw new CustomError(
    //     errorCodesMap.AUTHENTICATION_ERROR,
    //     config.clientPacket.account.LoginResponse,
    //     clientKey,
    //     socket,
    //   );
    // }

    // 마지막 유저 로그인 업데이트
    await userCommands.updateUserLogin(DatabaseManager, id);

    // UUID DB에 있는지 검증 후 발급
    const userId = !user.uuid
      ? await userCommands.createUserUuid(DatabaseManager, id, uuidv4())
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
