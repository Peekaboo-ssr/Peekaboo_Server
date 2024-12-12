class BaseManager {
  constructor() {
    if (new.target === BaseManager) {
      throw new TypeError('Cannot construct BaseManager intstances');
    }
  }
}

export default BaseManager;
