export const connectedServiceNotificationHandler = async (server, data) => {
  console.log('Distributor Info Data: ', data.message);
  console.log(data.microservices);
};
