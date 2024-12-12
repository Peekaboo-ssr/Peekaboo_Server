import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';

// 소켓에 보낼 에러 응답 값
const errorResponse = {
  [clientPacket.account.LoginResponse]: {
    payloadData: {
      globalFailCode: 3,
      userId: 'none',
      token: 'none',
    },
  },
};

export default errorResponse;
