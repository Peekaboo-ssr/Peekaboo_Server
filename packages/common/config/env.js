import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

// SERVER HOST
export const EC1_HOST = process.env.EC1_HOST || '0.0.0.0';
export const EC2_HOST = process.env.EC2_HOST || '0.0.0.0';

export const MONITOR_HOST = process.env.MONITOR_HOST || '127.0.0.1';

// SERVER PORT
export const LOBBY_PORT = process.env.LOBBY_PORT || '6000';
export const ACCOUNT_PORT = process.env.ACCOUNT_PORT || '6100';
export const DISTRIBUTOR_PORT = process.env.DISTRIBUTOR_PORT || '6200';
export const GATEWAY_PORT = process.env.GATEWAY_PORT || '6300';
export const SESSION_PORT = process.env.SESSION_PORT || '6400';
export const GAME_PORT = process.env.GAME_PORT || '6500';

// CLIENT
export const CLIENT_VERSION = process.env.CLIENT_VERSION || '1.0.0';

// DB SERVER
export const DB1_NAME = process.env.DB1_NAME || 'PEEKABOO_USER_DB';
export const DB2_NAME = process.env.DB2_NAME || 'PEEKABOO_GAME_DB';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'peekaboo1234';
export const DB_HOST = process.env.DB_HOST || '127.0.0.1';
export const DB_PORT = process.env.DB_PORT || '5000';

// REDIS SERVER
export const REDIS_HOST = process.env.REDIS_HOST || null;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;
export const REDIS_PORT = process.env.REDIS_PORT || null;

// AUTHENTICATION
export const SECRET_KEY = process.env.SECRET_KEY;
