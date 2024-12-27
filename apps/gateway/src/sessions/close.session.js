import config from '@peekaboo-ssr/config/gateway';
import { createPacketS2S } from '@peekaboo-ssr/utils/createPacket';

// 유저 Disconnect에 대한 처리 관련 함수 모음
export const exitUserFromSessionService = async (server, clientKey) => {
  try {
    const s2sPayload = {
      clientKey,
    };
    const packet = createPacketS2S(
      config.servicePacket.ExitSessionRequest,
      'gateway',
      'session',
      s2sPayload,
    );

    server.clientToDistributor.write(packet);
  } catch (e) {
    console.error(e);
  }
};

// 게이트웨이에 연결된 클라이언트 유저 삭제를 위한 함수
export const deleteUserToConnectClients = (server, clientKey) => {
  try {
    if (!server.connectClients[clientKey]) {
      console.error(`존재하지 않는 유저 클라이언트입니다.`);
      return;
    }
    // console.log(`deleteUserToConnectClients 수행 전: `, server.connectClients);
    const dedicateKey = server.connectClients[clientKey].dedicateKey;
    // 게임에 참가한 유저였는지 확인
    if (dedicateKey !== null) {
      // 참가한 유저의 데디에 해당 유저 삭제 요청
      exitUserNotificationToDedicated(server, clientKey, dedicateKey);
      // 데디케이티드 맵에서 해당 유저가 참여한 데디에서 유저 삭제
      deleteUserToDedicates(server, dedicateKey, clientKey);
      // 해당 유저 커넥션 정보에서 데디케이티드 정보 삭제
      server.connectClients[clientKey].dedicateKey = null;
    }

    exitUserFromSessionService(server, clientKey);

    delete server.connectClients[clientKey];
    // console.log(`deleteUserToConnectClients 수행 후: `, server.connectClients);
  } catch (e) {
    console.error(e);
  }
};

// 데디에서 유저를 삭제해주는 함수
export const deleteUserToDedicates = (server, dedicateKey, clientKey) => {
  try {
    // console.log(
    //   `deleteUserToDedicates 수행 전: `,
    //   server.mapClients.dedicates[dedicateKey].users,
    // );
    server.mapClients.dedicates[dedicateKey].users =
      server.mapClients.dedicates[dedicateKey].users.filter(
        (user) => user !== clientKey,
      );
    console.log(
      `deleteUserToDedicates 수행 후: `,
      server.mapClients.dedicates[dedicateKey].users,
    );
    // 만약 유저가 삭제되고 해당 세션에 유저 수가 0 이하라면 해당 데디 삭제
    // 어차피 데디에서도 유저 수 0명이면 삭제될 예정이기 때문
    if (server.mapClients.dedicates[dedicateKey].users.length <= 0) {
      delete server.mapClients.dedicates[dedicateKey];
      // console.log(
      //   `데디 현재 인원 0명으로 삭제 처리 진행: `,
      //   server.mapClients.dedicates,
      // );
    }
  } catch (e) {
    console.error(e);
  }
};

export const exitUserNotificationToDedicated = (
  server,
  clientKey,
  dedicateKey,
) => {
  const packet = createPacketS2S(
    config.servicePacket.ExitDedicatedRequestFromSocket,
    'gateway',
    dedicateKey,
    { clientKey },
  );
  server.clientToDistributor.write(packet);
};
