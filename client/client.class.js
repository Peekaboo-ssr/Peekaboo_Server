import {
  Position,
  Rotation,
} from 'c:/Users/KYH/Desktop/Peekaboo_GameServer/game/src/classes/models/moveInfo.class.js';
import { serializer } from 'c:/Users/KYH/Desktop/Peekaboo_GameServer/game/src/utils/packet/create.packet.js';
import net from 'net';
import parserPacket from 'c:/Users/KYH/Desktop/Peekaboo_GameServer/game/src/utils/packet/parser.packet.js';
import { config } from 'c:/Users/KYH/Desktop/Peekaboo_GameServer/game/src/config/config.js';
import { PACKET_TYPE } from 'c:/Users/KYH/Desktop/Peekaboo_GameServer/game/src/constants/header.js';

export const CLIENTTYPE = {
  GATECLIENT: 1,
  GAMECLIENT: 2,
};

class Client {
  constructor() {
    this.gatewayServerOption = {
      host: '0.0.0.0',
      port: 6000,
    };

    this.gameServerOption = {
      host: '0.0.0.0',
      port: 6666,
    };

    // ------------------------클라이언트 데이터--------------지속적인 추가----------------------
    this.token;
    this.userId;
    this.sequence;
    this.host = false;
    this.gameSessionId;

    // 호스트 기준
    this.inviteCode;

    this.position = new Position();
    this.rotation = new Rotation();

    // ------------------------클라이언트 데이터---------------------------------------------

    // 클라이언트 연결 설정
    this.buffer = Buffer.alloc(0);

    // 게이트 웨이 서버랑 연결된 소켓
    this.gateToClient = net.connect(this.gatewayServerOption, () => {
      console.log('Connection established');
    });
    this.gateToClient.on('data', (data) => this.onData(data));
    this.gateToClient.on('end', () => this.onEnd());
    this.gateToClient.on('error', (error) => this.onError(error));

    // 게임 서버랑 연결된 소켓
    this.gameToClient;
  }

  gameServerConnect() {
    this.gameToClient = net.connect(this.gameServerOption, () => {
      console.log('Connection established');
    });

    this.gameToClient.on('data', (data) => this.onData(data));
    this.gameToClient.on('end', () => this.onEnd());
    this.gameToClient.on('error', (error) => this.onError(error));
  }

  sendPacket(packetType, data, clientType) {
    const packet = serializer(packetType, data, this.sequence++);

    switch (clientType) {
      case CLIENTTYPE.GATECLIENT:
        {
          this.gateToClient.write(packet);
        }
        break;
      case CLIENTTYPE.GAMECLIENT:
        {
          this.gameToClient.write(packet);
        }
        break;
    }
  }

  onData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (
      this.buffer.length >=
      config.packet.typeLength + config.packet.versionLength
    ) {
      let offset = 0;
      const packetType = this.buffer.readUint16BE(offset);
      offset += config.packet.typeLength;

      const versionLength = this.buffer.readUint8(offset);
      offset += config.packet.versionLength;

      const totalHeaderLength =
        config.packet.typeLength +
        config.packet.versionLength +
        versionLength +
        config.packet.sequenceLength +
        config.packet.payloadLength;

      if (this.buffer.length < totalHeaderLength) {
        break;
      }

      const version = this.buffer
        .subarray(offset, offset + versionLength)
        .toString('utf-8');
      offset += versionLength;

      if (version !== config.client.clientVersion) {
        console.error(`Version mismatch: ${version}`);
        break;
      }

      const sequence = this.buffer.readUint32BE(offset);
      offset += config.packet.sequenceLength;

      const payloadLength = this.buffer.readUint32BE(offset);
      offset += config.packet.payloadLength;

      const totalPacketLength = totalHeaderLength + payloadLength;
      if (this.buffer.length < totalPacketLength) {
        break;
      } else {
        const payloadBuffer = this.buffer.subarray(
          offset,
          offset + payloadLength,
        );
        offset += payloadLength;

        try {
          const { payload } = parserPacket(payloadBuffer);
          this.buffer = this.buffer.subarray(offset);
          this.handlePacket(packetType, payload);
        } catch (e) {
          console.error('Error parsing packet:', e);
          this.buffer = this.buffer.subarray(offset);
        }
      }
    }
  }

  // 연결 종료 처리
  onEnd() {
    console.log('Connection closed by the server');
  }

  // 오류 처리
  onError(error) {
    console.error('Client error:', error.message);
  }

  // 패킷 처리
  handlePacket = (packetType, payload) => {
    //console.log(packetType, payload);

    switch (packetType) {
      case PACKET_TYPE.PlayerMoveNotification:
        {
          // Handle PlayerMoveNotification
        }
        break;
      case PACKET_TYPE.GhostMoveNotification:
        {
          // Handle GhostMoveNotification
        }
        break;
      case PACKET_TYPE.PingRequest:
        {
          const { timestamp } = payload;
          const data = { timestamp };

          // this.sendPacket(
          //   PACKET_TYPE.PingResponse,
          //   data,
          //   CLIENTTYPE.GAMECLIENT,
          // );
        }
        break;
      case PACKET_TYPE.PlayerStateChangeNotification:
        {
          // Handle PlayerStateChangeNotification
        }
        break;
      case PACKET_TYPE.GhostStateChangeNotification:
        {
          // Handle GhostStateChangeNotification
        }
        break;
      case PACKET_TYPE.ItemChangeNotification:
        {
        }
        break;
      case PACKET_TYPE.LoginResponse:
        {
          const { globalFailCode, userId, token } = payload;
          this.userId = userId;
          this.token = token;
        }
        break;
      case PACKET_TYPE.CreateRoomResponse:
        {
          const { globalFailCode, message, gameSessionId, inviteCode } =
            payload;
          this.gameSessionId = gameSessionId;
          this.inviteCode = inviteCode;
        }
        break;
      case PACKET_TYPE.JoinRoomResponse:
        {
          const { globalFailCode, message, gameSessionId, playerInfos } =
            payload;
          this.gameSessionId = gameSessionId;
        }
        break;
      case PACKET_TYPE.JoinRoomNotification:
        {
          // Handle JoinRoomNotification
        }
        break;
      case PACKET_TYPE.SpawnInitialDataRequest:
        {
          const position = {
            x: 0,
            y: 0,
            z: 0,
          };
          const rotation = {
            x: 0,
            y: 0,
            z: 0,
          };
          const moveInfo = {
            position,
            rotation,
          };
          const ghostInfos = [
            {
              ghostId: 1,
              ghostTypeId: 1,
              moveInfo,
            },
            {
              ghostId: 2,
              ghostTypeId: 2,
              moveInfo,
            },
          ];
          const itemInfos = [
            {
              itemId: 1,
              itemTypeId: 1,
              position,
            },
            {
              itemId: 2,
              itemTypeId: 1,
              position,
            },
            {
              itemId: 3,
              itemTypeId: 1,
              position,
            },
            {
              itemId: 4,
              itemTypeId: 1,
              position,
            },
          ];
          const data = {
            ghostInfos,
            itemInfos,
          };
          this.sendPacket(
            PACKET_TYPE.SpawnInitialDataResponse,
            data,
            CLIENTTYPE.GAMECLIENT,
          );
        }
        break;
      case PACKET_TYPE.StartStageNotification:
        {
          const { globalFailCode, message, ghostInfos, itemInfos } = payload;
        }
        break;
      case PACKET_TYPE.PlayerLifeResponse:
        {
          // Handle PlayerLifeResponse
        }
        break;
      case PACKET_TYPE.ItemGetResponse:
        {
          // Handle ItemGetResponse
        }
        break;
      case PACKET_TYPE.ItemUseResponse:
        {
          // Handle ItemUseResponse
        }
        break;
      case PACKET_TYPE.ItemUseNotification:
        {
          // Handle ItemUseNotification
        }
        break;
      case PACKET_TYPE.ItemDiscardResponse:
        {
          // Handle ItemDiscardResponse
        }
        break;
      case PACKET_TYPE.ItemDiscardNotification:
        {
          // Handle ItemDiscardNotification
        }
        break;
      case PACKET_TYPE.DoorToggleNotification:
        {
          // Handle DoorToggleNotification
        }
        break;
      case PACKET_TYPE.StageEndNotification:
        {
          // Handle StageEndNotification
        }
        break;
      case PACKET_TYPE.ExtractSoulNotification:
        {
          // Handle ExtractSoulNotification
        }
        break;
      case PACKET_TYPE.DisconnectPlayerNotification:
        {
          // Handle DisconnectPlayerNotification
        }
        break;
      case PACKET_TYPE.GhostSpecialStateNotification:
        {
          // Handle GhostSpecialStateNotification
        }
        break;
      case PACKET_TYPE.ItemDeleteNotification:
        {
          // Handle ItemDeleteNotification
        }
        break;
      case PACKET_TYPE.ItemDisuseNotification:
        {
          // Handle ItemDisuseNotification
        }
        break;
      default: {
        console.log(
          `패킷타입 잘못보냈어 확인해봐 packetType: ${packetType} payload: ${payload}`,
        );
      }
    }
  };
}
export default Client;
