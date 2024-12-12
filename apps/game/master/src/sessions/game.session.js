import { fork, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createDedicatedServer = (
  gameId,
  clientKey,
  inviteCode,
  userId,
) => {
  // 게임 세션을 위한 데디케이티드 서버를 생성한다.
  const scriptPath = path.join(
    __dirname,
    '../../../dedicated/src/dedicate.server.js',
  );
  fork(scriptPath, [clientKey, gameId, inviteCode, userId]);

  // const child = spawn('node', [scriptPath, clientKey, gameId, userId], {
  //   detached: true,
  //   stdio: 'ignore', // 부모와의 I/O 연결을 끊기 위해 ignore 사용
  // });
  // child.unref();
};
