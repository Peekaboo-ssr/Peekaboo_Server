import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';

const SERVICE_PACKET_MAPS = {
  [servicePacket.ConnectServiceRequest]: 'connectServiceRequest',
  [servicePacket.ConnectedServiceNotification]: 'connectedServiceNotification',
  [servicePacket.DisconnectServiceRequest]: 'disconnectServiceRequest',
  [servicePacket.DisconnectedServiceNotification]:
    'disconnectedServiceNotification',
  [servicePacket.CreateDedicatedRequest]: 'createDedicatedRequest',
  [servicePacket.ExitDedicatedRequestFromSocket]:
    'exitDedicatedRequestFromSocket',
  [servicePacket.ExitDedicatedRequestBySelf]: 'exitDedicatedRequestBySelf',
  [servicePacket.ConnectDedicatedRequest]: 'connectDedicatedRequest',
  [servicePacket.JoinDedicatedRequest]: 'joinDedicatedRequest',
  [servicePacket.UpdateRoomInfoRequest]: 'updateRoomInfoRequest',
  [servicePacket.DeleteDedicatedRequest]: 'deleteDedicatedRequest',
  [servicePacket.ExitSessionRequest]: 'exitSessionRequest',
};

export default SERVICE_PACKET_MAPS;
