import Queue from 'bull';
import { config } from '../../config/config.js';
import CustomError from '../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';
import { getUserByClientKey } from '../../sessions/user.sessions.js';
import { itemGetResponse } from '../../response/item/item.response.js';
import { itemGetNotification } from '../../notifications/item/item.notification.js';
import redisManager from './redisManager.js';

class ItemQueueManager {
  constructor(game) {
    this.game = game;
  }

  initializeItemQueue() {
    this.queue = new Queue(`${this.game.id}:itemQueue`, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    });

    this.queue.process(4, async (job) => {
      const startTime = Date.now();
      const { clientKey, itemId, inventorySlot } = job.data;

      const user = getUserByClientKey(this.game.users, clientKey);
      if (!user) {
        throw new CustomError(ErrorCodesMaps.USER_NOT_FOUND);
      }

      const item = this.game.getItem(itemId);

      // 혹시 모를 동시성 제어 2
      if (!item.mapOn) {
        return;
      }

      if (user.character.inventory.slot[inventorySlot - 1]) {
        return;
      }

      const lockKey = `lock:${clientKey}:${inventorySlot}`;

      //락을 걸엇으면 = ok 또는 락이 걸린상태 = null
      const lock = await redisManager
        .getClient()
        .set(lockKey, `slotLock:${inventorySlot}`, 'NX', 'EX', 10);
      if (!lock) {
        return;
      }
      try {
        user.character.inventory.slot[inventorySlot - 1] = itemId;

        user.character.inventory.itemCount++;

        item.mapOn = false;

        // 응답 보내주기
        // itemGetResponse(user.socket, itemId, newInventorySlot);
        itemGetResponse(
          user.clientKey,
          this.game.socket,
          itemId,
          inventorySlot,
        );
        itemGetNotification(this.game, itemId, user.id);

        if (!this.game.ghostCSpawn) {
          if (user.character.inventory.itemCount === 4) {
            this.game.ghostCSpawn === true;
            //ghostC 소환 요청 로직 추가
          }
        }
        console.log(Date.now() - startTime);
        console.log(user.character.inventory);
      } finally {
        await redisManager.getClient().del(lockKey);
      }
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} 실패 error:`, err);
    });
  }
}

export default ItemQueueManager;
