import { fork, spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// export const createDedicatedServer = (
//   gameId,
//   clientKey,
//   inviteCode,
//   userId,
// ) => {
//   // 게임 세션을 위한 데디케이티드 서버를 생성한다.
//   const scriptPath = path.join(
//     __dirname,
//     '../../../dedicated/src/dedicate.server.js',
//   );
//   fork(scriptPath, [clientKey, gameId, inviteCode, userId]);

// const child = spawn('node', [scriptPath, clientKey, gameId, userId], {
//   detached: true,
//   stdio: 'ignore', // 부모와의 I/O 연결을 끊기 위해 ignore 사용
// });
// child.unref();
// };

async function findPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(0, () => {
      const port = server.address().port; // 사용 가능한 포트
      server.close(() => resolve(port));
    });

    server.on('error', (err) => reject(err));
  });
}

export const createDedicatedServer = async (
  gameId,
  clientKey,
  inviteCode,
  userId,
  nickname,
) => {
  const port = await findPort();
  const containerName = `dedicated_${inviteCode}`;
  try {
    const runProcess = spawn('docker', [
      'run',
      '--rm',
      '-d',
      '--name',
      containerName,
      '-p',
      `${port}:${port}`,
      '-e',
      `GAME_ID=${gameId}`,
      '-e',
      `CLIENT_KEY=${clientKey}`,
      '-e',
      `INVITE_CODE=${inviteCode}`,
      '-e',
      `USER_ID=${userId}`,
      '-e',
      `PORT=${port}`,
      '-e',
      `NICKNAME=${nickname}`,
      'dedicated_server', //실행할 도커커 이미지 이름름
    ]);
  } catch (e) {
    console.error(e);
  }
};
