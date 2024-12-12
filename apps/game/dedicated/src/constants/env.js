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

// SERVER PORT
export const DISTRIBUTOR_PORT = process.env.DISTRIBUTOR_PORT || '6200';
export const GATEWAY_PORT = process.env.GATEWAY_PORT || '6300';

// DB 게임서버에서의 사용여부 X ?
export const DB_NAME = process.env.DB_NAME || 'USERS_DB';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'aaaa4321';
export const DB_HOST = process.env.DB_HOST || '127.0.0.1';
export const DB_PORT = process.env.DB_PORT || '3306';

// REDIS
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const SECRET_KEY = process.env.SECRET_KEY;
