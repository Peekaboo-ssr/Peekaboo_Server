import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';

const SERVICE_PACKET_MAPS = {
  [servicePacket.ConnectServiceRequest]: 'connectServiceRequest',
  [servicePacket.ConnectedServiceNotification]: 'connectedServiceNotification',
  [servicePacket.DisconnectServiceRequest]: 'disconnectServiceRequest',
  [servicePacket.DisconnectedServiceNotification]:
    'disconnectedServiceNotification',
  [servicePacket.CreateDedicatedRequest]: 'createDedicatedRequest',
  [servicePacket.ExitDedicatedRequestBySocket]: 'exitDedicatedRequestBySocket',
  [servicePacket.ExitDedicatedRequestBySelf]: 'exitDedicatedRequestBySelf',
  [servicePacket.ConnectDedicatedRequest]: 'ConnectDedicatedRequest',
  [servicePacket.JoinDedicatedRequest]: 'joinDedicatedRequest',
  [servicePacket.UpdateRoomInfoRequest]: 'updateRoomInfoRequest',
};

export default SERVICE_PACKET_MAPS;
