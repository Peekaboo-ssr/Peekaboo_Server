// src/scenario/scenarioManager.js
export class ScenarioManager {
  constructor(client, CLIENT_PACKET) {
    this.client = client;
    this.CLIENT_PACKET = CLIENT_PACKET;
    this.moveInterval = null;
  }

  async loginScenario(userData) {
    const loginData = { id: userData.id, password: userData.password };
    this.client.sendPacket(this.CLIENT_PACKET.account.LoginRequest, loginData);
  }

  async enterLobbyScenario(userData) {
    const enterLobbyData = { userId: userData.userId };
    this.client.sendPacket(
      this.CLIENT_PACKET.lobby.EnterLobbyRequest,
      enterLobbyData,
    );
  }

  async waitingRoomScenario(userData) {
    const waitingRoomData = { userId: userData.userId };
    this.client.sendPacket(
      this.CLIENT_PACKET.lobby.WaitingRoomListRequest,
      waitingRoomData,
    );
  }

  async createRoomScenario(userData) {
    const createRoomData = {
      userId: userData.id,
      token: userData.token,
    };
    this.client.sendPacket(
      this.CLIENT_PACKET.game.CreateRoomRequest,
      createRoomData,
    );

    // 응답 대기 (예: client가 특정 packetType에 대한 응답을 Promise로 반환하도록 구현)
    const response = await this.client.waitForResponse(
      this.CLIENT_PACKET.game.CreateRoomResponse,
    );

    // response 내 inviteCode 추출
    const inviteCode = response.inviteCode;
    return inviteCode;
  }

  async joinRoomScenario(userData, inviteCode) {
    const joinRoomData = {
      userId: userData.id,
      inviteCode,
      token: userData.token,
    };
    this.client.sendPacket(
      this.CLIENT_PACKET.game.JoinRoomRequest,
      joinRoomData,
    );
  }

  async moveScenario(userData, interval = 200) {
    this.moveInterval = setInterval(() => {
      const moveData = {
        playerMoveInfo: {
          userId: userData.userId,
          position: userData.position,
          rotation: userData.rotation,
        },
      };
      this.client.sendPacket(
        this.CLIENT_PACKET.dedicated.PlayerMoveRequest,
        moveData,
      );
    }, interval);
  }

  stopMoveScenario() {
    if (this.moveInterval) clearInterval(this.moveInterval);
  }
}
