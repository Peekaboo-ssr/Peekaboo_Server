import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';

const SERVICE_PACKET_MAPS = {
  [servicePacket.ConnectServiceRequest]: 'connectServiceRequest',
  [servicePacket.ConnectedServiceNotification]: 'connectedServiceNotification',
  [servicePacket.DisconnectServiceRequest]: 'disconnectServiceRequest',
  [servicePacket.DisconnectedServiceNotification]:
    'disconnectedServiceNotification',
  [servicePacket.CreateDedicatedRequest]: 'createDedicatedRequest',
  [servicePacket.ExitDedicatedRequest]: 'exitDedicatedRequest',
  [servicePacket.ConnectDedicateRequest]: 'connectDedicateRequest',
  [servicePacket.JoinDedicatedRequest]: 'joinDedicatedRequest',
};

export default SERVICE_PACKET_MAPS;
