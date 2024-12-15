export const packetNames = {
  common: {
    GamePacket: 'common.GamePacket',
    ServicePacket: 'common.ServicePacket',
  },
};

export const PACKET_TYPE = {
  game: {
    // 1 ~ 15
    PlayerMoveRequest: 1,
    PlayerMoveNotification: 2,
    GhostMoveRequest: 3,
    GhostMoveNotification: 4,
    PingRequest: 5, // S2C
    PingResponse: 6, // C2S
    PlayerStateChangeRequest: 7,
    PlayerStateChangeNotification: 8,
    GhostStateChangeRequest: 9,
    GhostStateChangeNotification: 10,
    ItemChangeRequest: 11,
    ItemChangeNotification: 12,

    // 플레이어 : 100번대
    PlayerAttackedRequest: 101,
    PlayerLifeResponse: 102,

    // 귀신 : 200번대
    GhostSpecialStateRequest: 201,
    GhostSpecialStateNotification: 202,
    GhostAttackedRequest: 203,
    GhostSpawnRequest: 204,
    GhostSpawnNotification: 205,
    GhostDeleteNotification: 206,

    // 아이템 : 300번대
    ItemGetRequest: 301,
    ItemGetResponse: 302,
    ItemGetNotification: 303,
    ItemUseRequest: 304,
    ItemUseResponse: 305,
    ItemUseNotification: 306,
    ItemDiscardRequest: 307,
    ItemDiscardResponse: 308,
    ItemDiscardNotification: 309,
    ItemDisuseRequest: 310,
    ItemDisuseNotification: 311,
    ItemDeleteNotification: 312,
    ItemPurchaseRequest: 313,
    ItemPurchaseNotification: 314,
    ItemPurchaseResponse: 315,
    ItemCreateRequest: 316,
    ItemCreateNotification: 317,

    // 문 : 350번대
    DoorToggleRequest: 350,
    DoorToggleNotification: 351,

    // 게임 시스템 : 400번대
    ExtractSoulRequest: 401,
    ExtractSoulNotification: 402,
    DisconnectPlayerNotification: 403,
    RemainingTimeNotification: 404,
    BlockInteractionNotification: 405,
    StartStageRequest: 406,
    SpawnInitialDataRequest: 407,
    SpawnInitialDataResponse: 408,
    StartStageNotification: 409,
    StageEndNotification: 410,
    SubmissionEndNotification: 411,

    // 로그인, 로비 : 500번대
    RegistAccountRequest: 500,
    RegistAccountResponse: 501,
    LoginRequest: 502,
    LoginResponse: 503,
    ChangeNicknameRequest: 504,
    ChangeNicknameResponse: 505,
    EnterLobbyRequest: 506,
    EnterLobbyResponse: 507,
    RefreshLobbyRequest: 508,
    RefreshLobbyResponse: 509,
    SearchRoomRequest: 510,
    SearchRoomResponse: 511,

    // 방 : 600번대
    CreateRoomRequest: 601,
    CreateRoomResponse: 602,
    JoinRoomRequest: 603,
    JoinRoomResponse: 604,
    JoinRoomNotification: 605,
  },
  service: {
    ConnectServiceRequest: 1,
    ConnectedServiceNotification: 2,
    DisconnectServiceRequest: 3,
    DisconnectedServiceNotification: 4,
    CreateDedicatedRequest: 5,
    ExitDedicatedRequest: 6,
    ConnectDedicateRequest: 7,
    JoinDedicatedRequest: 8,
  },
};

export const PACKET_MAPS = {
  client: {
    // 1 ~ 15
    [PACKET_TYPE.game.PlayerMoveRequest]: 'playerMoveRequest',
    [PACKET_TYPE.game.PlayerMoveNotification]: 'playerMoveNotification',
    [PACKET_TYPE.game.GhostMoveRequest]: 'ghostMoveRequest',
    [PACKET_TYPE.game.GhostMoveNotification]: 'ghostMoveNotification',
    [PACKET_TYPE.game.PingRequest]: 'pingRequest', // S2C
    [PACKET_TYPE.game.PingResponse]: 'pingResponse', // C2S
    [PACKET_TYPE.game.PlayerStateChangeRequest]: 'playerStateChangeRequest',
    [PACKET_TYPE.game.PlayerStateChangeNotification]:
      'playerStateChangeNotification',
    [PACKET_TYPE.game.GhostStateChangeRequest]: 'ghostStateChangeRequest',
    [PACKET_TYPE.game.GhostStateChangeNotification]:
      'ghostStateChangeNotification',
    [PACKET_TYPE.game.ItemChangeRequest]: 'itemChangeRequest',
    [PACKET_TYPE.game.ItemChangeNotification]: 'itemChangeNotification',

    // 플레이어 : 100번대
    [PACKET_TYPE.game.PlayerAttackedRequest]: 'playerAttackedRequest',
    [PACKET_TYPE.game.PlayerLifeResponse]: 'playerLifeResponse',

    // 귀신 : 200번대
    [PACKET_TYPE.game.GhostAttackedRequest]: 'ghostAttackedRequest',
    [PACKET_TYPE.game.GhostSpawnRequest]: 'ghostSpawnRequest',
    [PACKET_TYPE.game.GhostSpawnNotification]: 'ghostSpawnNotification',
    [PACKET_TYPE.game.GhostDeleteNotification]: 'ghostDeleteNotification',

    // 아이템 : 300번대
    [PACKET_TYPE.game.ItemGetRequest]: 'itemGetRequest',
    [PACKET_TYPE.game.ItemGetResponse]: 'itemGetResponse',
    [PACKET_TYPE.game.ItemGetNotification]: 'itemGetNotification',
    [PACKET_TYPE.game.ItemUseRequest]: 'itemUseRequest',
    [PACKET_TYPE.game.ItemUseResponse]: 'itemUseResponse',
    [PACKET_TYPE.game.ItemUseNotification]: 'itemUseNotification',
    [PACKET_TYPE.game.ItemDiscardRequest]: 'itemDiscardRequest',
    [PACKET_TYPE.game.ItemDiscardResponse]: 'itemDiscardResponse',
    [PACKET_TYPE.game.ItemDiscardNotification]: 'itemDiscardNotification',
    [PACKET_TYPE.game.ItemDisuseRequest]: 'itemDisuseRequest',
    [PACKET_TYPE.game.ItemDisuseNotification]: 'itemDisuseNotification',
    [PACKET_TYPE.game.ItemDeleteNotification]: 'itemDeleteNotification',
    [PACKET_TYPE.game.ItemPurchaseRequest]: 'itemPurchaseRequest',
    [PACKET_TYPE.game.ItemPurchaseNotification]: 'itemPurchaseNotification',
    [PACKET_TYPE.game.ItemPurchaseResponse]: 'itemPurchaseResponse',
    [PACKET_TYPE.game.ItemCreateRequest]: 'itemCreateRequest',
    [PACKET_TYPE.game.ItemCreateNotification]: 'itemCreateNotification',

    // 문 : 350번대
    [PACKET_TYPE.game.DoorToggleRequest]: 'doorToggleRequest',
    [PACKET_TYPE.game.DoorToggleNotification]: 'doorToggleNotification',

    // 게임 시스템 : 400번대
    [PACKET_TYPE.game.ExtractSoulRequest]: 'extractSoulRequest',
    [PACKET_TYPE.game.ExtractSoulNotification]: 'extractSoulNotification',
    [PACKET_TYPE.game.DisconnectPlayerNotification]:
      'disconnectPlayerNotification',
    [PACKET_TYPE.game.BlockInteractionNotification]:
      'blockInteractionNotification',
    [PACKET_TYPE.game.RemainingTimeNotification]: 'remainingTimeNotification',
    [PACKET_TYPE.game.StartStageRequest]: 'startStageRequest',
    [PACKET_TYPE.game.SpawnInitialDataRequest]: 'spawnInitialDataRequest',
    [PACKET_TYPE.game.SpawnInitialDataResponse]: 'spawnInitialDataResponse',
    [PACKET_TYPE.game.StartStageNotification]: 'startStageNotification',
    [PACKET_TYPE.StageEndNotification]: 'stageEndNotification',
    [PACKET_TYPE.SubmissionEndNotification]: 'submissionEndNotification',

    // 로그인, 로비 : 500번대
    [PACKET_TYPE.game.RegistAccountRequest]: 'registAccountRequest',
    [PACKET_TYPE.game.RegistAccountResponse]: 'registAccountResponse',
    [PACKET_TYPE.game.LoginRequest]: 'loginRequest',
    [PACKET_TYPE.game.LoginResponse]: 'loginResponse',
    [PACKET_TYPE.game.ChangeNicknameRequest]: 'changeNicknameRequest',
    [PACKET_TYPE.game.ChangeNicknameResponse]: 'changeNicknameResponse',
    [PACKET_TYPE.game.EnterLobbyRequest]: 'enterLobbyRequest',
    [PACKET_TYPE.game.EnterLobbyResponse]: 'enterLobbyResponse',
    [PACKET_TYPE.game.RefreshLobbyRequest]: 'refreshLobbyRequest',
    [PACKET_TYPE.game.RefreshLobbyResponse]: 'refreshLobbyResponse',
    [PACKET_TYPE.game.SearchRoomRequest]: 'searchRoomRequest',
    [PACKET_TYPE.game.SearchRoomResponse]: 'searchRoomResponse',

    // 방 : 600번대
    [PACKET_TYPE.game.CreateRoomRequest]: 'createRoomRequest',
    [PACKET_TYPE.game.CreateRoomResponse]: 'createRoomResponse',
    [PACKET_TYPE.game.JoinRoomRequest]: 'joinRoomRequest',
    [PACKET_TYPE.game.JoinRoomResponse]: 'joinRoomResponse',
    [PACKET_TYPE.game.JoinRoomNotification]: 'joinRoomNotification',

    [PACKET_TYPE.game.StageEndNotification]: 'stageEndNotification',
  },
  service: {
    [PACKET_TYPE.service.ConnectServiceRequest]: 'connectServiceRequest',
    [PACKET_TYPE.service.ConnectedServiceNotification]:
      'connectedServiceNotification',
    [PACKET_TYPE.service.DisconnectServiceRequest]: 'disconnectServiceRequest',
    [PACKET_TYPE.service.DisconnectedServiceNotification]:
      'disconnectedServiceNotification',
    [PACKET_TYPE.service.CreateDedicatedRequest]: 'createDedicatedRequest',
    [PACKET_TYPE.service.ExitDedicatedRequest]: 'exitDedicatedRequest',
    [PACKET_TYPE.service.ConnectDedicateRequest]: 'connectDedicateRequest',
    [PACKET_TYPE.service.JoinDedicatedRequest]: 'joinDedicatedRequest',
  },
};
