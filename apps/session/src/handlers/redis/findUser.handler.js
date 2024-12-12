// 찾아서 무엇을 response로 줄건지?
export const findUserHandler = (serverInstance, data) => {
  try {
    console.log('findUser..........');
    let resMessage = {
      isSuccess: false,
    };

    resMessage.isSuccess = true;
    serverInstance.pubSubManager.publisher.publish(
      data.responseChannel,
      JSON.stringify(resMessage),
    );

    console.log(`Published response to ${responseChannel}:`, response);
  } catch (e) {
    console.error(e);
  }
};
