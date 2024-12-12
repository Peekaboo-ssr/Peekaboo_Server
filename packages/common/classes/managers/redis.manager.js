import Redis from 'ioredis';
import config from '@peekaboo-ssr/config/shared';

class RedisManager {
  constructor() {
    if (!RedisManager.instance) {
      this.publisherClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => Math.min(times * 100, 2000),
      });

      this.subscriberClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => Math.min(times * 100, 2000),
      });

      // get, set, hset, hget 등 일반적인 명령어 수행을 위한 클라이언트
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => Math.min(times * 100, 2000),
      });

      setupClientEvents(this.publisherClient, 'Publisher');
      setupClientEvents(this.subscriberClient, 'Subscriber');
      setupClientEvents(this.client, 'Default');

      RedisManager.instance = this;
    }
    return RedisManager.instance;
  }

  getClient() {
    return this.client;
  }

  getPublisherClient() {
    return this.publisherClient;
  }

  getSubscriberClient() {
    return this.subscriberClient;
  }
}

// Redis 연결 및 에러 핸들링
const setupClientEvents = (client, type) => {
  client.on('error', (error) => console.error(`Redis ${type} Error:`, error));
  client.on('connect', () => console.log(`Connected to Redis ${type}`));
  client.on('reconnecting', (times) =>
    console.log(`Redis ${type} reconnecting... Attempt: ${times}`),
  );
};

export default RedisManager;
