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
    timeout = 15000,
  ) {
    return new Promise((resolve, reject) => {
      console.log(`Preparing to subscribe to ${responseChannel}`);
      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(responseChannel)) {
          console.error(`Timeout for responseChannel: ${responseChannel}`);
          this.pendingRequests.delete(responseChannel);
          this.subscriber.unsubscribe(responseChannel);
          reject(new Error(`Response timed out after ${timeout}ms`));
        }
      }, timeout);

      this.pendingRequests.set(responseChannel, { resolve, reject, timeoutId });

      // 구독 설정
      this.subscriber.subscribe(responseChannel, (err) => {
        if (err) {
          console.error(
            `Failed to subscribe to ${responseChannel}: ${err.message}`,
          );
          this.pendingRequests.delete(responseChannel);
          clearTimeout(timeoutId);
          reject(err);
        } else {
          console.log(`Successfully subscribed to ${responseChannel}`);
          // 요청 발행
          this.publisher.publish(
            requestChannel,
            JSON.stringify(message),
            (err) => {
              if (err) {
                console.error(
                  `Failed to publish message to ${requestChannel}: ${err.message}`,
                );
                this.pendingRequests.delete(responseChannel);
                clearTimeout(timeoutId);
                this.subscriber.unsubscribe(responseChannel);
                reject(err);
              } else {
                console.log(`Published message to ${requestChannel}:`, message);
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
