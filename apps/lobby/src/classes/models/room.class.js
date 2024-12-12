export class Room {
  constructor(gameSessionId, name) {
    this.gameSessionId = gameSessionId;
    this.roomName = name;
    this.users = [];
  }
}
