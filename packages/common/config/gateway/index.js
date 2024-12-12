import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import { EC1_HOST, GATEWAY_PORT, SECRET_KEY } from '@peekaboo-ssr/config/env';
import SHARED_CONFIG from '@peekaboo-ssr/config/shared';

const GATEWAY_CONFIG = {
  ...SHARED_CONFIG,
  clientPacket,
  servicePacket,
  gateway: {
    host: EC1_HOST,
    port: GATEWAY_PORT,
  },
  auth: {
    secretKey: SECRET_KEY,
  },
};

export default GATEWAY_CONFIG;
