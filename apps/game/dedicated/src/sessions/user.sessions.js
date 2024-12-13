export const getUserByClientKey = (users, clientKey) => {
  return users.find((user) => user.clientKey === clientKey);
};

// ---------------------------------------- 이 아래는 삭제할 것.
