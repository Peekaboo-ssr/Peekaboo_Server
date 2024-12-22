import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import clientState from '@peekaboo-ssr/modules-constants/clientState';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

// 소켓에 보낼 에러 응답 값
const errorResponse = {
  [clientPacket.account.RegistAccountResponse]: {
    [errorCodesMap.AUTHENTICATION_ERROR.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.AUTHENTICATION_FAILED,
      },
    },
  },
  [clientPacket.account.LoginResponse]: {
    [errorCodesMap.DUPLICATED_USER_CONNECT.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.DUPLICATED_USER,
        userId: 'none',
        token: 'none',
      },
    },
    [errorCodesMap.AUTHENTICATION_ERROR.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.AUTHENTICATION_FAILED,
        userId: 'none',
        token: 'none',
      },
    },
  },
  [clientPacket.dedicated.CreateRoomResponse]: {
    [errorCodesMap.INVALID_PACKET.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.INVALID_REQUEST,
        message: '정상적인 요청이 아니거나 생성 중 오류가 발생했습니다.',
        gameSessionId: '',
        inviteCode: '',
      },
    },
  },
};

export default errorResponse;
