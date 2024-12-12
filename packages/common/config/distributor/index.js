import SHARED_CONFIG from '@peekaboo-ssr/config/shared';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';

const DISTRIBUTOR_CONFIG = {
  ...SHARED_CONFIG,
  servicePacket,
};

export default DISTRIBUTOR_CONFIG;
