export const HEADERS = {
  header: {
    client: {
      typeLength: 2,
      clientKeyLength: 1,
      broadcastLength: 1,
      payloadLength: 4,
    },
    service: {
      typeLength: 2,
      senderLength: 1,
      receiverLength: 1,
      payloadLength: 4,
    },
    route: {
      typeLength: 2,
      clientKeyLength: 1,
      payloadLength: 4,
    },
  },
};
