import Queue from 'bull';
import RedisManager from './redis.manager.js'; // Updated RedisManager
import { doorToggleNotification } from '../../notifications/door/door.notification.js';
import { itemGetNotification } from '../../notifications/item/item.notification.js';
import { itemGetResponse } from '../../response/item/item.response.js';
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';
import { getUserByClientKey } from '../../sessions/user.sessions.js';

class GameQueueManager {
  constructor(game) {
    this.game = game;
    this.queue = new Queue(`${this.game.id}:gameQueue`, {
      createClient: function (type) {
        const client = RedisManager.getClient();
        // Use the shared RedisManager for connection management
        switch (type) {
          case 'client':
            return client;
          case 'subscriber':
          case 'bclient':
            return client.duplicate({
              enableReadyCheck: false, // Disable for compatibility with Bull
              maxRetriesPerRequest: null, // Avoid retry issues
            });
          default:
            throw new Error(`Unknown Redis client type: ${type}`);
        }
      },
    });
  }

  initializeQueue() {
    this.queue.process(8, async (job) => {
      const { type, data } = job.data;

      switch (type) {
        case 'door':
          await this.handleDoorJob(data);
          break;
        case 'item':
          await this.handleItemJob(data);
          break;
        default:
          throw new CustomError(errorCodesMap.UNKNOWN_JOB_TYPE);
      }
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} 실패 error:`, err);
    });
  }

  async handleDoorJob(data) {
    const { doorId, doorState } = data;

    const door = this.game.getDoor(doorId);
    if (!door) {
      throw new CustomError(errorCodesMap.DOOR_NOT_FOUND);
    }

    if (!door.checkDoorInteraction(doorState)) {
      return;
    }

    door.setStatus(doorState);

    const payload = { doorId, doorState };
    doorToggleNotification(this.game, payload);
  }

  async handleItemJob(data) {
    const { clientKey, itemId, inventorySlot } = data;

    const user = getUserByClientKey(this.game.users, clientKey);
    if (!user) {
      throw new CustomError(errorCodesMap.USER_NOT_FOUND);
    }

    const item = this.game.getItem(itemId);

    if (!item.mapOn) {
      return;
    }

    if (user.character.inventory.slot[inventorySlot - 1]) {
      return;
    }

    const lockKey = `lock:${clientKey}:${inventorySlot}`;

    const lock = await RedisManager.getClient().set(
      lockKey,
      `slotLock:${inventorySlot}`,
      'NX',
      'EX',
      10,
    );
    if (!lock) {
      return;
    }
    try {
      user.character.inventory.slot[inventorySlot - 1] = itemId;
      user.character.inventory.itemCount++;
      item.mapOn = false;

      itemGetResponse(user.clientKey, this.game.socket, itemId, inventorySlot);
      itemGetNotification(this.game, itemId, user.id);
    } finally {
      await RedisManager.getClient().del(lockKey);
    }
  }
}

export default GameQueueManager;
