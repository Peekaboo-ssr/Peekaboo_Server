// 음...
/**
 * 세션에 대한 정리
 *  전체 세션을 가지고 있는 타입 (user) => 없애고, 변경이 되도록 타입이
 * userSessions : {
 *  [clientKey] : {
 *      type: '...',    // 속해있는 세션 타입
 *      userId: '...'   // 유저의 UUID
 *  }
 * }
 */

// 특정 타입 세션에 참가 처리하는 함수
export const joinSessionByType = (userSessions, type, userData) => {
  // 만약 해당 유저의 세션이 없다면 등록해줌.
  if (!userSessions[userData.clientKey]) {
    userSessions[userData.clientKey] = {
      type,
      userId: userData.uuid,
    };
  } else {
    // 존재한다면 해당 유저의 세션을 옮겨주는 작업
    userSessions[userData.clientKey].type = type;
  }
  console.log('현재 세션 정보: ', userSessions);
};

// 세션에 나가기 처리하는 함수
export const exitUserFromSession = (userSessions, clientKey) => {
  // 만약 해당 유저의 세션이 없다면 return
  if (!userSessions[clientKey]) {
    console.error(`${clientKey} 클라이언트의 세션 기록이 없습니다.`);
    return;
  }
  delete userSessions[clientKey];
};

export const getSessionByType = (userSessions, type) => {
  return userSessions[type];
};

export const getUserByUUID = (userSessions, uuid) => {
  return userSessions.find((user) => user.uuid === uuid);
};

export const getUserByClientKey = (userSessions, clientKey) => {
  return userSessions.find((user) => user.clientKey === clientKey);
};
