export const connectedServiceNotificationHandler = async (server, payload) => {
  console.log('Distributor Info payload: ', payload.message);
  console.log(payload.microservices);
};
