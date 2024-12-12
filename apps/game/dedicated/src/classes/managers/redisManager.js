import Redis from 'ioredis';
import { config } from '../../config/config.js';

class RedisManager {
  constructor() {
    if (!RedisManager.instance) {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => Math.min(times * 100, 2000),
      });

      // Redis 연결 및 에러 핸들링
      this.client.on('error', (error) => console.error('Redis Error:', error));
      this.client.on('connect', () => console.log('Connected to Redis Cloud'));

      RedisManager.instance = this;
    }
    return RedisManager.instance;
  }

  getClient = () => this.client;
}

const redisManager = new RedisManager();

export default redisManager;
