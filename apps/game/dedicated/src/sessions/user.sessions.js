export const getUserByClientKey = (users, clientKey) => {
  return users.find((user) => user.clientKey === clientKey);
};

export const getUserByUserID = (users, userId) => {
  return users.find((user) => user.id === userId);
};

// ---------------------------------------- 이 아래는 삭제할 것.
