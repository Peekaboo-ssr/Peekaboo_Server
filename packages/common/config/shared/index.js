import clientHeader from '@peekaboo-ssr/modules-constants/clientHeader';
import serviceHeader from '@peekaboo-ssr/modules-constants/serviceHeader';
import routeHeader from '@peekaboo-ssr/modules-constants/routeHeader';
import pubAction from '@peekaboo-ssr/modules-constants/pubAction';
import subChannel from '@peekaboo-ssr/modules-constants/subChannel';
import clientState from '@peekaboo-ssr/modules-constants/clientState';
import redisKey from '@peekaboo-ssr/modules-constants/redisKey';

import {
  DB1_NAME,
  DB2_NAME,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  EC1_HOST,
  DISTRIBUTOR_PORT,
  CLIENT_VERSION,
  SESSION_PORT,
} from '@peekaboo-ssr/config/env';

const SHARED_CONFIG = {
  version: CLIENT_VERSION,
  distributor: {
    host: EC1_HOST,
    port: DISTRIBUTOR_PORT,
  },
  session: {
    host: EC1_HOST,
    port: SESSION_PORT,
  },
  header: {
    service: serviceHeader,
    client: clientHeader,
    route: routeHeader,
  },
  databases: {
    USER_DB: {
      name: DB1_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
    GAME_DB: {
      name: DB2_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
    SYSTEM_DB: {},
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    gameSetKey: redisKey.REDIS_GAME_SET_KEY,
    userSetKey: redisKey.REDIS_USER_SET_KEY,
  },
  pubAction: pubAction,
  subChannel: subChannel,
  clientState,
};

export default SHARED_CONFIG;
