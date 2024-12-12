import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import { EC1_HOST, LOBBY_PORT } from '@peekaboo-ssr/config/env';
import SHARED_CONFIG from '@peekaboo-ssr/config/shared';

const LOBBY_CONFIG = {
  ...SHARED_CONFIG,
  clientPacket,
  servicePacket,
  lobby: {
    host: EC1_HOST,
    port: LOBBY_PORT,
  },
};

export default LOBBY_CONFIG;
