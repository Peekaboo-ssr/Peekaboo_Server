import Redis from 'ioredis';
import { config } from '../../config/config.js';

class RedisManager {
  constructor() {
    if (!RedisManager.instance) {
      // Initialize the primary Redis client
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => Math.min(times * 100, 2000),
      });

      // Set up Redis event listeners
      this.client.on('error', (error) => console.error('Redis Error:', error));
      this.client.on('connect', () => console.log('Connected to Redis Cloud'));

      // Create a map for duplicate connections
      this.duplicateConnections = new Map();

      RedisManager.instance = this;
    }

    return RedisManager.instance;
  }

  // Get the primary Redis client
  getClient = () => this.client;

  getDuplicateClient = (key) => {
    if (!this.duplicateConnections.has(key)) {
      const duplicateClient = this.client.duplicate({
        enableReadyCheck: false, // Disable ready check
        maxRetriesPerRequest: null, // Disable retries
      });

      duplicateClient.on('error', (error) =>
        console.error(`Duplicate Redis Error [${key}]:`, error),
      );
      duplicateClient.on('connect', () =>
        console.log(`Duplicate Redis Client Connected [${key}]`),
      );

      this.duplicateConnections.set(key, duplicateClient);
    }

    return this.duplicateConnections.get(key);
  };

  // Close all Redis connections
  closeAllConnections = async () => {
    for (const [key, duplicateClient] of this.duplicateConnections.entries()) {
      await duplicateClient.quit();
      console.log(`Duplicate Redis Client Closed [${key}]`);
    }

    await this.client.quit();
    console.log('Primary Redis Client Closed');
  };
}

export default new RedisManager();
