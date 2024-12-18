export const connectedServiceNotificationHandler = async (server, data) => {
  console.log('Distributor Info Data: ', data);
  server.onDistribute(data);
};
