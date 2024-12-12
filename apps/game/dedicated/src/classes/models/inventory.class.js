export class Inventory {
  constructor() {
    this.slot = [0, 0, 0, 0];
    this.itemCount = 0;
  }

  removeInventorySlot(clientSlot) {
    const itemId = this.slot[clientSlot];
    this.slot[clientSlot] = 0;
    this.itemCount--;
    return itemId;
  }
}
