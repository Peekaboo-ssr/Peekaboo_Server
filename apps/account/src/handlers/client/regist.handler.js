import config from '@peekaboo-ssr/config/account';
import { createPacketS2G } from '@peekaboo-ssr/utils/createPacket';
import DatabaseManager from '@peekaboo-ssr/classes/DatabaseManager';
import userCommands from '@peekaboo-ssr/commands/userCommands';
import bcrypt from 'bcrypt';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import handleError from '@peekaboo-ssr/error/handleError';

export const registAccountHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { id, password, nickname } = payload;

  try {
    // DB 검증, ID / PASSWORD 검증
    const user = await userCommands.findUser(DatabaseManager, id);

    // 유저가 이미 존재하는 경우 에러 반환
    if (user) {
      throw new CustomError(
        errorCodesMap.DUPLICATED_USER,
        config.clientPacket.account.RegistAccountResponse,
        clientKey,
        socket,
      );
    }

    const salt = bcrypt.genSaltSync(10);
    // bcrypt로 비밀번호 변경
    const hashPassword = await bcrypt.hash(password, salt);

    // 회원가입 진행
    await userCommands.createUser(DatabaseManager, id, hashPassword, nickname);

    const payloadDataForClient = {
      globalFailCode: config.clientState.globalFailCode.NONE,
    };
    const packet = createPacketS2G(
      config.clientPacket.account.RegistAccountResponse,
      clientKey,
      payloadDataForClient,
    );

    socket.write(packet);
  } catch (e) {
    handleError(e);
  }
};
