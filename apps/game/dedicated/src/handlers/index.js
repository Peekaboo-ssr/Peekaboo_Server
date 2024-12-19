import config from '@peekaboo-ssr/config/game';
import { movePlayerRequestHandler } from './game/player/movePlayer.handler.js';
import { moveGhostRequestHandler } from './game/ghost/moveGhost.handler.js';
import { pingHandler } from './game/system/ping.handler.js';
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
import { startStageRequestHandler } from './game/system/startStage.handler.js';
import { ghostSpecialStateRequestHandler } from './game/ghost/ghostSpecialState.handler.js';
import { itemCreateHandler } from './game/item/itemCreate.handler.js';
import { itemPurchaseHandler } from './game/store/store.handler.js';
import { connectedServiceNotificationHandler } from './service/connectService.handler.js';
import { exitDedicatedHandler } from './service/exitDedicate.handler.js';
import { joinDedicatedHandler } from './service/joinDedicate.handler.js';
import { lifeUpdateHandler } from './game/player/life.handler.js';

export const handlers = {
  client: {
    [config.clientPacket.dedicated.PlayerMoveRequest]: {
      handler: movePlayerRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.GhostMoveRequest]: {
      handler: moveGhostRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.PingResponse]: {
      handler: pingHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------장재영 작업--------------------------*/
    [config.clientPacket.dedicated.StartStageRequest]: {
      handler: startStageRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.DoorToggleRequest]: {
      handler: doorToggleRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.PlayerStateChangeRequest]: {
      handler: playerStateChangeRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.PlayerAttackedRequest]: {
      handler: playerAttackedRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.ItemGetRequest]: {
      handler: itemGetRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.ItemChangeRequest]: {
      handler: itemChangeRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.ItemUseRequest]: {
      handler: itemUseRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.ItemDiscardRequest]: {
      handler: itemDiscardRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.ItemDisuseRequest]: {
      handler: itemDisuseRequestHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------장재영 작업--------------------------*/
    /*-------------------------권영현 작업--------------------------*/
    [config.clientPacket.dedicated.ExtractSoulRequest]: {
      handler: extractorSoulHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------권영현 작업--------------------------*/
    /*-------------------------문진수 작업--------------------------*/
    [config.clientPacket.dedicated.GhostStateChangeRequest]: {
      handler: ghostStateChangeRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.GhostAttackedRequest]: {
      handler: ghostAttackedRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.GhostSpecialStateRequest]: {
      handler: ghostSpecialStateRequestHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.ItemCreateRequest]: {
      handler: itemCreateHandler,
      protoType: 'common.GamePacket',
    },
    /*-------------------------문진수 작업--------------------------*/
    /*-------------------------권영현 작업--------------------------*/
    [config.clientPacket.dedicated.ItemPurchaseRequest]: {
      handler: itemPurchaseHandler,
      protoType: 'common.GamePacket',
    },
    [config.clientPacket.dedicated.LifeUpdateRequest]: {
      handler: lifeUpdateHandler,
      protoType: 'common.GamePacket',
    },
  },
  service: {
    [config.servicePacket.ConnectedServiceNotification]: {
      handler: connectedServiceNotificationHandler,
    },
    [config.servicePacket.ExitDedicatedRequest]: {
      handler: exitDedicatedHandler,
    },
    [config.servicePacket.JoinDedicatedRequest]: {
      handler: joinDedicatedHandler,
    },
  },
};
