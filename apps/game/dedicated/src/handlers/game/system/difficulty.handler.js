import { Position } from '../../../classes/models/moveInfo.class.js';
import {
  selectDifficultyNotification,
  submissionEndNotification,
} from '../../../notifications/system/system.notification.js';
import Ghost from '../../../classes/models/ghost.class.js';
import { ghostSpawnNotification } from '../../../notifications/ghost/ghost.notification.js';
import IntervalManager from '../../../classes/managers/interval.manager.js';
import { ghostsLocationNotification } from '../../../notifications/ghost/ghost.notification.js';

export const selectDifficultyHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { difficultyId } = payload;

  if (server.game.day === 0) {
    console.log('submissionEnd............');
    const submissionResult = await server.game.endSubmission();
    console.log('submissionCheck 이후 결과: ', submissionResult);
    submissionEndNotification(server.game, submissionResult);
    if (submissionResult) {
      server.game.setDifficulty(difficultyId);
      selectDifficultyNotification(server.game, difficultyId);
    }
    if (!submissionResult) {
      console.log('submissionEnd 연출을 위한 귀신 소환 요청...');
      // 귀신 여럿 소환
      const ghostSpawnPositions = server.game.gameAssets.endGhostPos.data.map(
        (data) => {
          const [x, y, z] = data.GhostSpawnPos.split(',').map(Number);
          return new Position(x, y, z);
        },
      );
      // 같은 귀신 종류 X2 소환, 하드코딩해서 미안해요 : 윤수빈
      const ghostTypes = [1001, 1003, 1005];
      const ghostSpawnArr = [...ghostTypes, ...ghostTypes];
      for (let i = 0; i < ghostSpawnPositions.length; i++) {
        const ghostData = server.game.gameAssets.ghost.data.find((ghost) => {
          return ghost.Id === ghostSpawnArr[i];
        });
        const ghost = new Ghost(
          server.game.getUniqueGhostId(),
          ghostData.Id,
          ghostSpawnPositions[i],
          ghostData.Speed,
        );
        server.game.ghosts.push(ghost);
        const moveInfo = {
          position: ghost.position.getPosition(),
          rotation: ghost.rotation.getRotation(),
        };
        const ghostInfo = {
          ghostId: ghost.id,
          ghostTypeId: ghost.ghostTypeId,
          moveInfo,
        };
        console.log(ghostInfo);
        ghostSpawnNotification(server.game, ghostInfo);
      }

      IntervalManager.getInstance().addGhostsInterval(
        server.game.id,
        () => ghostsLocationNotification(server.game),
        100,
      );
    }
  } else {
    server.game.setDifficulty(difficultyId);
    selectDifficultyNotification(server.game, difficultyId);
  }
};
