import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import clientState from '@peekaboo-ssr/modules-constants/clientState';

// 소켓에 보낼 에러 응답 값
const errorResponse = {
  [clientPacket.account.RegistAccountResponse]: {
    payloadData: {
      globalFailCode: clientState.globalFailCode.UNKNOWN_ERROR,
    },
  },
  [clientPacket.account.LoginResponse]: {
    payloadData: {
      globalFailCode: clientState.globalFailCode.UNKNOWN_ERROR,
      userId: 'none',
      token: 'none',
    },
  },
  [clientPacket.dedicated.CreateRoomResponse]: {
    payloadData: {
      globalFailCode: clientState.globalFailCode.INVALID_REQUEST,
      message: '정상적인 요청이 아니거나 생성 중 오류가 발생했습니다.',
      gameSessionId: '',
      inviteCode: '',
    },
  },
};

export default errorResponse;
