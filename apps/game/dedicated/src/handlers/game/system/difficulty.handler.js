import { Position } from '../../../classes/models/moveInfo.class.js';
import {
  selectDifficultyNotification,
  submissionEndNotification,
} from '../../../notifications/system/system.notification.js';
import Ghost from '../../../classes/models/ghost.class.js';
import { ghostSpawnNotification } from '../../../notifications/ghost/ghost.notification.js';

export const selectDifficultyHandler = async (
  socket,
  clientKey,
  payload,
  server,
) => {
  const { difficultyId } = payload;

  if (server.game.day === 0) {
    const submissionResult = await server.game.endSubmission();
    submissionEndNotification(server.game, submissionResult);
    if (submissionResult) {
      server.game.setDifficulty(difficultyId);
    }
    if (!submissionResult) {
      // 귀신 여럿 소환
      const ghostSpawnPositions = server.game.gameAssets.endGhostPos.data.map(
        (data) => {
          const [x, y, z] = data.POS.split(',').map(Number);
          return new Position(x, y, z);
        },
      );
      // 하드코딩해서 미안해요 : 윤수빈
      const ghostTypes = server.game.gameAssets.difficulty.data[2].SpawnGhost;
      // 같은 귀신 종류 X2 하기위함 => 이것도 나중에 귀신 종류 추가되면 변경되어야 함.
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
        const moveInfo = {
          position: ghost.position.getPosition(),
          rotation: ghost.rotation.getRotation(),
        };
        const ghostInfo = {
          ghostId: ghost.id,
          ghostTypeId: ghost.ghostTypeId,
          moveInfo,
        };

        ghostSpawnNotification(server.game, ghostInfo);
      }
    }
  } else {
    server.game.setDifficulty(difficultyId);
    selectDifficultyNotification(server.game, difficultyId);
  }
  // 클라에서 difficultyId를 인덱스로 전달해서 difficultyId에 100을 더해서 사용한다.
};
