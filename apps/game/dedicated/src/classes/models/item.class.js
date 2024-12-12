import { Position, Rotation } from './moveInfo.class.js';

class Item {
  constructor(itemId, itemTypeId, position, rotation = null) {
    this.id = itemId;
    this.typeId = itemTypeId;
    this.position = new Position(position.x, position.y, position.z);
    this.on = false; // 아이템 사용 중 = 1, 사용 x = 0
    this.mapOn = true;
  }
}

export default Item;
