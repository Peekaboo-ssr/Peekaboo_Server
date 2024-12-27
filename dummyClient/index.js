// src/index.js
import path from 'path';
import { fileURLToPath } from 'url';
import { ProtoLoader } from './proto/loader.proto.js';
import { PacketHelper } from './managers/packet.manager.js';
import { DummyClient } from './clients/dummy.client.js';
import { ScenarioManager } from './managers/scenario.manager.js';
import { delay } from './utils/delay.js';
import {
  CLIENT_PACKET,
  CLIENT_PACKET_MAPS,
  headerConfig,
  packetNames,
} from './config/config.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const protoDir = path.join(__dirname, '../packages/common/protobufs');

(async () => {
  const protoLoader = new ProtoLoader(protoDir, packetNames);
  await protoLoader.load();

  const packetHelper = new PacketHelper(
    protoLoader,
    headerConfig,
    CLIENT_PACKET_MAPS,
  );

  // 여러 클라이언트에 대한 설정들
  const clientsData = [
    {
      userData: {
        id: 'test5',
        password: '1234',
        token: 'tokenTest5',
        userId: '54bad508-8172-459c-96a1-91307295d9dd',
        position: { x: 21.24, y: 15.2, z: 8.66 },
        rotation: { x: 1.2, y: 11.5, z: 6.9 },
      },
      host: '0.0.0.0',
      port: 6000,
    },
    {
      userData: {
        id: 'test4',
        password: '1234',
        token: 'tokenTest4',
        userId: '3f023a42-7b55-4bd9-bdfb-9cbf0e4583bb',
        position: { x: 10.0, y: 10.0, z: 10.0 },
        rotation: { x: 0.0, y: 0.0, z: 0.0 },
      },
      host: '0.0.0.0',
      port: 6000,
    },
    // 필요하다면 더 추가 가능
  ];

  // clients와 scenarioManagers를 담을 배열
  const clients = [];
  const scenarioManagers = [];

  for (const cData of clientsData) {
    const client = new DummyClient({
      host: cData.host,
      port: cData.port,
      packetHelper,
      CLIENT_PACKET,
    });

    await client.connect(); // 각 클라이언트 접속

    const scenario = new ScenarioManager(client, CLIENT_PACKET);
    clients.push({ client, userData: cData.userData });
    scenarioManagers.push(scenario);
  }
  // 이제 각 클라이언트에 대해 병렬 시나리오 수행 가능
  await runScenario(clients, scenarioManagers);
  // await waitRoomScenario(clients, scenarioManagers);
  // await createRoomScenario(clients, scenarioManagers);
})();

const createRoomScenario = async (clients, scenarioManagers) => {
  // const data = client.userData;
  // await scenarioManager.loginScenario(data);
  // await delay(5000);
  // await scenarioManager.joinRoomScenario(data, 'GIZX07T1AC');
  // await delay(5000);
  // await scenarioManager.moveScenario(data, 500);
  // 모든 클라이언트 로그인
  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].loginScenario(userData);
  }

  await delay(5000);

  // 모든 클라이언트 로비 진입
  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].enterLobbyScenario(userData);
  }

  await delay(5000);

  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].joinRoomScenario(userData, '8WVZ33GYX6');
  }
};

const waitRoomScenario = async (clients, scenarioManagers) => {
  const firstClientUserData = clients[0].userData;
  // 모든 클라이언트 로그인
  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].loginScenario(userData);
  }

  await delay(5000);

  // 모든 클라이언트 로비 진입
  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].enterLobbyScenario(userData);
  }
  await delay(5000);
  // await scenarioManagers[0].enterLobbyScenario(firstClientUserData);
  const inviteCode = '7L9NZIUI01';

  await delay(5000);
  scenarioManagers[1].joinRoomScenario(firstClientUserData, inviteCode);
  // await scenarioManagers[0].waitingRoomScenario(firstClientUserData);
};

const runScenario = async (clients, scenarioManagers) => {
  // 모든 클라이언트 로그인
  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].loginScenario(userData);
  }

  await delay(5000);

  // 모든 클라이언트 로비 진입
  for (let i = 0; i < clients.length; i++) {
    const { userData } = clients[i];
    await scenarioManagers[i].enterLobbyScenario(userData);
  }

  await delay(5000);

  // 첫 번째 클라이언트만 방 생성 및 생성될 때까지 대기
  const firstClientUserData = clients[0].userData;
  const secondClientUserData = clients[1].userData;

  await scenarioManagers[0].waitingRoomScenario(firstClientUserData);
  // const inviteCode = await scenarioManagers[0].createRoomScenario(
  //   firstClientUserData,
  // );
  // await scenarioManagers[0].createRoomScenario(firstClientUserData);

  // 두 번째 클라이언트가 방 참가
  // scenarioManagers[1].joinRoomScenario(secondClientUserData, inviteCode);

  // 첫 번째 클라이언트만 이동 시나리오 시작
  // scenarioManagers[0].moveScenario(firstClientUserData, 100);

  // await delay(6000);

  // scenarioManagers[1].moveScenario(secondClientUserData, 100);

  // await delay(5000);

  // // 두 번째 클라이언트 종료
  // clients[1].client.close();

  // 첫 번째 클라이언트 종료
  // clients[0].client.close();

  // 모든 클라이언트 종료
  // for (const { client } of clients) {
  //   client.close();
  // }
  // await scManager1.loginScenario();
};
