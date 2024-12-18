import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';

const CLIENT_PACKET_MAPS = {
  // 로그인, 로비 : 500번대
  [clientPacket.account.RegistAccountRequest]: 'registAccountRequest',
  [clientPacket.account.RegistAccountResponse]: 'registAccountResponse',
  [clientPacket.account.LoginRequest]: 'loginRequest',
  [clientPacket.account.LoginResponse]: 'loginResponse',
  [clientPacket.account.ChangeNicknameRequest]: 'changeNicknameRequest',
  [clientPacket.account.ChangeNicknameResponse]: 'changeNicknameResponse',
  [clientPacket.lobby.EnterLobbyRequest]: 'enterLobbyRequest',
  [clientPacket.lobby.EnterLobbyResponse]: 'enterLobbyResponse',
  [clientPacket.lobby.WaitingRoomListRequest]: 'waitingRoomListRequest',
  [clientPacket.lobby.WaitingRoomListResponse]: 'waitingRoomListResponse',

  // 방 : 600번대
  [clientPacket.game.CreateRoomRequest]: 'createRoomRequest',
  [clientPacket.dedicated.CreateRoomResponse]: 'createRoomResponse',
  [clientPacket.game.JoinRoomRequest]: 'joinRoomRequest',
  [clientPacket.dedicated.JoinRoomResponse]: 'joinRoomResponse',
  [clientPacket.game.JoinRoomByGameSessionIdRequest]:
    'joinRoomByGameSessionIdRequest',
  [clientPacket.dedicated.JoinRoomNotification]: 'joinRoomNotification',

  // 플레이어 : 1 ~ 15
  [clientPacket.dedicated.PlayerMoveRequest]: 'playerMoveRequest',
  [clientPacket.dedicated.PlayerMoveNotification]: 'playerMoveNotification',
  [clientPacket.dedicated.GhostMoveRequest]: 'ghostMoveRequest',
  [clientPacket.dedicated.GhostMoveNotification]: 'ghostMoveNotification',
  [clientPacket.dedicated.PingRequest]: 'pingRequest', // S2C
  [clientPacket.dedicated.PingResponse]: 'pingResponse', // C2S
  [clientPacket.dedicated.PlayerStateChangeRequest]: 'playerStateChangeRequest',
  [clientPacket.dedicated.PlayerStateChangeNotification]:
    'playerStateChangeNotification',
  [clientPacket.dedicated.GhostStateChangeRequest]: 'ghostStateChangeRequest',
  [clientPacket.dedicated.GhostStateChangeNotification]:
    'ghostStateChangeNotification',
  [clientPacket.dedicated.ItemChangeRequest]: 'itemChangeRequest',
  [clientPacket.dedicated.ItemChangeNotification]: 'itemChangeNotification',

  // 플레이어 : 100번대
  [clientPacket.dedicated.PlayerAttackedRequest]: 'playerAttackedRequest',
  [clientPacket.dedicated.PlayerLifeResponse]: 'playerLifeResponse',

  // 귀신 : 200번대
  [clientPacket.dedicated.GhostSpecialStateRequest]: 'ghostSpecialStateRequest',
  [clientPacket.dedicated.GhostSpecialStateNotification]:
    'ghostSpecialStateNotification',
  [clientPacket.dedicated.GhostAttackedRequest]: 'ghostAttackedRequest',
  [clientPacket.dedicated.GhostSpawnRequest]: 'ghostSpawnRequest',
  [clientPacket.dedicated.GhostSpawnNotification]: 'ghostSpawnNotification',
  [clientPacket.dedicated.GhostDeleteNotification]: 'ghostDeleteNotification',

  // 아이템 : 300번대
  [clientPacket.dedicated.ItemGetRequest]: 'itemGetRequest',
  [clientPacket.dedicated.ItemGetResponse]: 'itemGetResponse',
  [clientPacket.dedicated.ItemGetNotification]: 'itemGetNotification',
  [clientPacket.dedicated.ItemUseRequest]: 'itemUseRequest',
  [clientPacket.dedicated.ItemUseResponse]: 'itemUseResponse',
  [clientPacket.dedicated.ItemUseNotification]: 'itemUseNotification',
  [clientPacket.dedicated.ItemDiscardRequest]: 'itemDiscardRequest',
  [clientPacket.dedicated.ItemDiscardResponse]: 'itemDiscardResponse',
  [clientPacket.dedicated.ItemDiscardNotification]: 'itemDiscardNotification',
  [clientPacket.dedicated.ItemDisuseRequest]: 'itemDisuseRequest',
  [clientPacket.dedicated.ItemDisuseNotification]: 'itemDisuseNotification',
  [clientPacket.dedicated.ItemDeleteNotification]: 'itemDeleteNotification',
  [clientPacket.dedicated.ItemPurchaseRequest]: 'itemPurchaseRequest',
  [clientPacket.dedicated.ItemPurchaseNotification]: 'itemPurchaseNotification',
  [clientPacket.dedicated.ItemPurchaseResponse]: 'itemPurchaseResponse',
  [clientPacket.dedicated.ItemCreateRequest]: 'itemCreateRequest',
  [clientPacket.dedicated.ItemCreateNotification]: 'itemCreateNotification',

  // 문 : 350번대
  [clientPacket.dedicated.DoorToggleRequest]: 'doorToggleRequest',
  [clientPacket.dedicated.DoorToggleNotification]: 'doorToggleNotification',

  // 게임 시스템 : 400번대
  [clientPacket.dedicated.ExtractSoulRequest]: 'extractSoulRequest',
  [clientPacket.dedicated.ExtractSoulNotification]: 'extractSoulNotification',
  [clientPacket.dedicated.DisconnectPlayerNotification]:
    'disconnectPlayerNotification',
  [clientPacket.dedicated.RemainingTimeNotification]:
    'remainingTimeNotification',
  [clientPacket.dedicated.BlockInteractionNotification]:
    'blockInteractionNotification',
  [clientPacket.dedicated.StartStageRequest]: 'startStageRequest',
  [clientPacket.dedicated.StartStageNotification]: 'startStageNotification',
  [clientPacket.dedicated.StageEndNotification]: 'stageEndNotification',
  [clientPacket.dedicated.SubmissionEndNotification]:
    'submissionEndNotification',
};

export default CLIENT_PACKET_MAPS;
