import { PACKET_TYPE } from '../constants/packet.js';
import { movePlayerRequestHandler } from './game/player/movePlayer.handler.js';
import { moveGhostRequestHandler } from './game/ghost/moveGhost.handler.js';
import { pingHandler } from './game/ping.handler.js';
import { doorToggleRequestHandler } from './game/door/door.handler.js';
import {
  playerAttackedRequestHandler,
  playerStateChangeRequestHandler,
} from './game/player/player.handler.js';
import {
  itemChangeRequestHandler,
  itemDiscardRequestHandler,
  itemDisuseRequestHandler,
  itemGetRequestHandler,
  itemUseRequestHandler,
} from './game/item/item.handler.js';
import { ghostAttackedRequestHandler } from './game/ghost/ghostAttacked.handler.js';
import { ghostStateChangeRequestHandler } from './game/ghost/ghostStateChange.handler.js';
import { extractorSoulHandler } from './game/Extractor/extractor.handler.js';
import {
  spawnInitialDataResponseHandler,
  startStageRequestHandler,
} from './game/room/waitingRoom.handler.js';
import { ghostSpecialStateRequestHandler } from './game/ghost/ghostSpecialState.handler.js';
import { ghostSpawnHandler } from './game/ghost/ghostSpawn.handler.js';
import { itemCreateHandler } from './game/item/itemCreate.handler.js';
import { itemPurchaseHandler } from './game/store/store.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';
import { exitDedicatedHandler } from './service/exitDedicate.handler.js';
import { joinDedicatedHandler } from './service/joinDedicate.handler.js';

export const handlers = {
  client: {
    [PACKET_TYPE.game.PlayerMoveRequest]: {
      handler: movePlayerRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.GhostMoveRequest]: {
      handler: moveGhostRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.PingResponse]: {
      handler: pingHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------장재영 작업--------------------------*/
    [PACKET_TYPE.game.StartStageRequest]: {
      handler: startStageRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.SpawnInitialDataResponse]: {
      handler: spawnInitialDataResponseHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.DoorToggleRequest]: {
      handler: doorToggleRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.PlayerStateChangeRequest]: {
      handler: playerStateChangeRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.PlayerAttackedRequest]: {
      handler: playerAttackedRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.ItemGetRequest]: {
      handler: itemGetRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.ItemChangeRequest]: {
      handler: itemChangeRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.ItemUseRequest]: {
      handler: itemUseRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.ItemDiscardRequest]: {
      handler: itemDiscardRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.ItemDisuseRequest]: {
      handler: itemDisuseRequestHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------장재영 작업--------------------------*/
    /*-------------------------권영현 작업--------------------------*/
    [PACKET_TYPE.game.ExtractSoulRequest]: {
      handler: extractorSoulHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------권영현 작업--------------------------*/
    /*-------------------------문진수 작업--------------------------*/
    [PACKET_TYPE.game.GhostStateChangeRequest]: {
      handler: ghostStateChangeRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.GhostAttackedRequest]: {
      handler: ghostAttackedRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.GhostSpecialStateRequest]: {
      handler: ghostSpecialStateRequestHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.GhostSpawnRequest]: {
      handler: ghostSpawnHandler,
      protoType: 'common.GamePacket',
    },
    [PACKET_TYPE.game.ItemCreateRequest]: {
      handler: itemCreateHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------문진수 작업--------------------------*/
    /*-------------------------권영현 작업--------------------------*/
    [PACKET_TYPE.game.ItemPurchaseRequest]: {
      handler: itemPurchaseHandler,
      protoType: 'common.GamePacket',
    },
  },
  service: {
    [PACKET_TYPE.service.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
    [PACKET_TYPE.service.ExitDedicatedRequest]: {
      handler: exitDedicatedHandler,
    },
    [PACKET_TYPE.service.JoinDedicatedRequest]: {
      handler: joinDedicatedHandler,
    },
  },
};
