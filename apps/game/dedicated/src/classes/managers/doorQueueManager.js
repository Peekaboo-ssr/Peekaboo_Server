import Queue from 'bull';
import { config } from '../../config/config.js';
import { doorToggleNotification } from '../../notifications/door/door.notification.js';
import { getGameSessionById } from '../../sessions/game.session.js';
import CustomError from '../../Error/custom.error.js';
import { ErrorCodesMaps } from '../../Error/error.codes.js';

class DoorQueueManager {
  constructor(gameId) {
    this.queue = new Queue(`${gameId}:doorQueue`, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    });

    this.queue.process(4, async (job) => {
      // const startTime = Date.now();

      const { gameSessionId, userId, doorId, doorState } = job.data;

      // 게임 세션 검증
      const gameSession = getGameSessionById(gameSessionId);
      if (!gameSession) {
        throw new CustomError(ErrorCodesMaps.GAME_NOT_FOUND);
      }

      // 문 검증
      const door = gameSession.getDoor(doorId);
      if (!door) {
        throw new CustomError(ErrorCodesMaps.DOOR_NOT_FOUND);
      }

      const curDoorState = door.getStatus();

      // 현재 문 상태와 문 상호작용이 가능한지 체크
      if (!door.checkDoorInteraction(doorState)) {
        // console.log(
        //   `"Fail ${
        //     doorState
        //   }" [${doorId}] Door (${curDoorState} => ${doorState}) by User ${userId}`,
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

      doorToggleNotification(gameSession, payload);

      // doorQueue Log
      // const endTime = Date.now();
      // console.log(
      //   `"Success [${doorId}] Door (${curDoorState} => ${doorState}) by User ${userId}`,
      // );
      //console.log(`Elapsed Time : ${endTime - startTime}`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} 실패 error:`, err);
    });
  }
}

export default DoorQueueManager;
