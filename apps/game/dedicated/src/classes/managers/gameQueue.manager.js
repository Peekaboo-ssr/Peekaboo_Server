import Queue from 'bull';
import RedisManager from './redis.manager.js'; // Updated RedisManager
import { doorToggleNotification } from '../../notifications/door/door.notification.js';
import { itemGetNotification } from '../../notifications/item/item.notification.js';
import { itemGetResponse } from '../../response/item/item.response.js';
import CustomError from '../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';
import { handleError } from '../../Error/error.handler.js';
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
    this.queue.process(4, async (job) => {
      const { type, data } = job.data;

      switch (type) {
        case 'door':
          await this.handleDoorJob(data);
          break;
        case 'item':
          await this.handleItemJob(data);
          break;
        default:
          throw new CustomError('UNKNOWN_JOB_TYPE');
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
      throw new CustomError(ErrorCodesMaps.DOOR_NOT_FOUND);
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
      throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
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

      if (!this.game.ghostCSpawn && user.character.inventory.itemCount === 4) {
        this.game.ghostCSpawn = true;
        // ghostC 소환 요청 로직 추가
      }
    } finally {
      await RedisManager.getClient().del(lockKey);
    }
  }
}

export default GameQueueManager;
