const SERVICE_PACKET = {
  ConnectServiceRequest: 1,
  ConnectedServiceNotification: 2,
  DisconnectServiceRequest: 3,
  DisconnectedServiceNotification: 4,
  CreateDedicatedRequest: 5,
  ExitDedicatedRequestBySocket: 6,
  ExitDedicatedRequestBySelf: 7,
  ConnectDedicatedRequest: 8,
  JoinDedicatedRequest: 9,
  UpdateRoomInfoRequest: 10,
};

export default SERVICE_PACKET;
