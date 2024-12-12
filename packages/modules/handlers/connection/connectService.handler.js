export const connectedServiceNotificationHandler = async (server, data) => {
  if (server.context.name === 'gateway') {
    server.onDistribute(data);
  }

  if (server.context.name !== 'dedicated') {
    console.log('Distributor Info Data: ', data.message);

    if (
      server.context.name === 'gateway' ||
      server.context.name === 'distributor'
    ) {
      console.log(data.microservices);
      console.log(data.dedicates);
    } else {
      console.log(data.microservices);
    }
  }
};
