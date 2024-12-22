import clientPacket from '@peekaboo-ssr/modules-constants/clientPacket';
import servicePacket from '@peekaboo-ssr/modules-constants/servicePacket';
import { EC1_HOST, GAME_PORT } from '@peekaboo-ssr/config/env';
import SHARED_CONFIG from '@peekaboo-ssr/config/shared';

const GAME_CONFIG = {
  ...SHARED_CONFIG,
  clientPacket,
  servicePacket,
  game: {
    host: EC1_HOST,
    port: GAME_PORT,
  },
};

export default GAME_CONFIG;
