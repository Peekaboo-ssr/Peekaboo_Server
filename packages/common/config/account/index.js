import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import { ACCOUNT_PORT, EC1_HOST, SECRET_KEY } from '@peekaboo-ssr/config/env';
import SHARED_CONFIG from '@peekaboo-ssr/config/shared';

const ACCOUNT_CONFIG = {
  ...SHARED_CONFIG,
  clientPacket,
  servicePacket,
  account: {
    host: EC1_HOST,
    port: ACCOUNT_PORT,
  },
  jwt: {
    key: SECRET_KEY,
    expiresIn: '1h',
  },
};

export default ACCOUNT_CONFIG;
