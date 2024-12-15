import Queue from 'bull';
import { config } from '../../config/config.js';
import { doorToggleNotification } from '../../notifications/door/door.notification.js';
import CustomError from '../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';

class DoorQueueManager {
  constructor(game) {
    this.game = game;
  }

  initializeDoorQueue() {
    this.queue = new Queue(`${this.game.id}:doorQueue`, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    });

    this.queue.process(4, async (job) => {
      // const startTime = Date.now();

      const { doorId, doorState } = job.data;

      // 문 검증
      const door = this.game.getDoor(doorId);
      if (!door) {
        throw new CustomError(ErrorCodesMaps.DOOR_NOT_FOUND);
      }

      const curDoorState = door.getStatus();

      // 현재 문 상태와 문 상호작용이 가능한지 체크
      if (!door.checkDoorInteraction(doorState)) {
        // console.log(
        //   `"Fail ${
        //     doorState
        //   }" [${doorId}] Door (${curDoorState} => ${doorState}) by User ${clientKey}`,
        // );
        return;
      }

      // 상호작용이 가능하므로 문 상호작용해준다.
      door.setStatus(doorState);

      // 문 상호작용 결과에 대한 Notification
      const payload = {
        doorId,
        doorState,
      };

      doorToggleNotification(this.game, payload);

      // doorQueue Log
      // const endTime = Date.now();
      // console.log(
      //   `"Success [${doorId}] Door (${curDoorState} => ${doorState}) by User ${clientKey}`,
      // );
      //console.log(`Elapsed Time : ${endTime - startTime}`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} 실패 error:`, err);
    });
  }
}

export default DoorQueueManager;
