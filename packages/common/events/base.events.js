// 각 핸들러들의 베이스가 되는 핸들러
class BaseEvent {
  onConnection(socket) {
    throw new Error('onConnection must be implemented');
  }

  onData(socket, data, serverInstance) {
    throw new Error('onData must be implemented');
  }

  onEnd(socket) {
    throw new Error('onEnd must be implemented');
  }

  onError(socket, err) {
    throw new Error('onError must be implemented');
  }
}

export default BaseEvent;
