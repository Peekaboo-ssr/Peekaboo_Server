class PubSubManager {
  constructor(redisManager) {
    this.publisher = redisManager.getPublisherClient();
    this.subscriber = redisManager.getSubscriberClient();

    this.pendingRequests = new Map();
    // Map<responseChannel, { resolve, reject, timeoutId }>

    // 하나의 글로벌 message 핸들러
    this.subscriber.on('message', (channel, responseMessage) => {
      const pending = this.pendingRequests.get(channel);
      if (!pending) return;
      const { resolve, timeoutId } = pending;
      clearTimeout(timeoutId);
      this.pendingRequests.delete(channel);
      this.subscriber.unsubscribe(channel);
      console.log(`Unsubscribed from ${channel}`);
      resolve(JSON.parse(responseMessage));
    });
  }

  sendAndWaitForResponse(
    requestChannel,
    responseChannel,
    message,
    timeout = 10000,
  ) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        // 타임아웃 시
        if (this.pendingRequests.has(responseChannel)) {
          this.pendingRequests.delete(responseChannel);
          this.subscriber.unsubscribe(responseChannel);
          console.log(`Unsubscribed from ${responseChannel} due to timeout`);
          reject(new Error(`Response timed out after ${timeout}ms`));
        }
      }, timeout);

      this.pendingRequests.set(responseChannel, { resolve, reject, timeoutId });

      // 응답 채널 구독
      this.subscriber.subscribe(responseChannel, (err) => {
        if (err) {
          this.pendingRequests.delete(responseChannel);
          clearTimeout(timeoutId);
          reject(
            new Error(
              `Failed to subscribe to ${responseChannel}: ${err.message}`,
            ),
          );
        } else {
          console.log(`Subscribed to ${responseChannel}`);
          // 요청 메시지 발송
          this.publisher.publish(
            requestChannel,
            JSON.stringify(message),
            (err) => {
              if (err) {
                this.pendingRequests.delete(responseChannel);
                clearTimeout(timeoutId);
                this.subscriber.unsubscribe(responseChannel);
                reject(
                  new Error(
                    `Failed to publish message to ${requestChannel}: ${err.message}`,
                  ),
                );
              } else {
                console.log(`Published to ${requestChannel}:`, message);
              }
            },
          );
        }
      });
    });
  }

  async sendMessage(requestChannel, message) {
    this.publisher.publish(requestChannel, JSON.stringify(message), (err) => {
      if (err) {
        console.error(
          `Failed to publish message to ${requestChannel}: ${err.message}`,
        );
      } else {
        console.log(`Published to ${requestChannel}:`, message);
      }
    });
  }
}

export default PubSubManager;
