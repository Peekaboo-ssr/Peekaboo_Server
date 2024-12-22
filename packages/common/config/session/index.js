import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import { EC1_HOST, SESSION_PORT } from '@peekaboo-ssr/config/env';
import SHARED_CONFIG from '@peekaboo-ssr/config/shared';

const SESSION_CONFIG = {
  ...SHARED_CONFIG,
  servicePacket,
  clientPacket,
  session: {
    host: EC1_HOST,
    port: SESSION_PORT,
  },
};

export default SESSION_CONFIG;
