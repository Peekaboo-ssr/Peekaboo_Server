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
};

export default errorResponse;
