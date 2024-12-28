import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import clientState from '@peekaboo-ssr/modules-constants/clientState';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

// 소켓에 보낼 에러 응답 값
const errorResponse = {
  [clientPacket.account.RegistAccountResponse]: {
    [errorCodesMap.DUPLICATED_USER.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.DUPLICATED_USER,
      },
    },
    [errorCodesMap.AUTHENTICATION_ERROR.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.AUTHENTICATION_FAILED,
      },
    },
  },
  [clientPacket.account.LoginResponse]: {
    [errorCodesMap.DUPLICATED_USER.code]: {
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
  [clientPacket.lobby.ChangeNicknameResponse]: {
    [errorCodesMap.HANDLER_ERROR.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.UNKNOWN_ERROR,
        nickname: '',
        message: '알 수 없는 이유로 변경 실패',
      },
    },
  },
  [clientPacket.lobby.WaitingRoomListResponse]: {
    [errorCodesMap.HANDLER_ERROR.code]: {
      payloadData: {
        roomInfos: [],
        globalFailCode: clientState.globalFailCode.UNKNOWN_ERROR,
      },
    },
  },
  [clientPacket.dedicated.JoinRoomResponse]: {
    [errorCodesMap.USER_NOT_FOUND.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.AUTHENTICATION_FAILED,
        message: '유저 인증에 실패했습니다.',
        gameSessionId: '',
        playerInfos: [],
      },
    },
    [errorCodesMap.GAME_NOT_FOUND.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.NOT_FOUND,
        message: '게임을 찾을 수 없습니다.',
        gameSessionId: '',
        playerInfos: [],
      },
    },
    [errorCodesMap.GAME_IS_STARTED.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.STARTED_GAME,
        message: '게임이 시작된 상태로 참여가 불가합니다.',
        gameSessionId: '',
        playerInfos: [],
      },
    },
    [errorCodesMap.GAME_IS_FULLED.code]: {
      payloadData: {
        globalFailCode: clientState.globalFailCode.FULLED_GAME,
        message: '게임에 인원이 모두 찬 상태로 참여가 불가합니다.',
        gameSessionId: '',
        playerInfos: [],
      },
    },
  },
};

export default errorResponse;
