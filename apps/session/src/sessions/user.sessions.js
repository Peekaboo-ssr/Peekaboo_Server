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
import CustomError from '@peekaboo-ssr/error/CustomError';
import errorCodesMap from '@peekaboo-ssr/error/errorCodesMap';

// 특정 타입 세션에 참가 처리하는 함수
export const joinSessionByType = (userSessions, userData) => {
  // 로그인할 때 uuid를 받을텐데 이미 로그인한 유저인지 확인
  if (userData.uuid) {
    const key = getUserByUUID(userSessions, userData.uuid);
    if (key) {
      // 만약 클라이언트키가 다르다면 중복 로그인 처리
      if (key !== userData.clientKey)
        throw new CustomError(errorCodesMap.DUPLICATED_USER_CONNECT);
    }
  }

  // 만약 해당 유저의 세션이 없다면 등록해줌.
  if (!userSessions[userData.clientKey]) {
    // 유저 세션에 참여하는 경우 등록
    if (type === 'user') {
      userSessions[userData.clientKey] = {
        type,
        userId: userData.uuid,
      };
    } else {
      // 만약 타입이 user가 아닌 다른 경우 비정상 접속 요청
      console.log('비정상 접속 확인');
      throw new CustomError(errorCodesMap.INVALID_PACKET);
    }
  }
  // 존재한다면 해당 유저의 세션을 옮겨주는 작업
  else {
    const session = userSessions[userData.clientKey];
    if (session) {
      session.type = userData.type;
    }
  }
  console.log(
    `${userData.clientKey} 유저가 ${userData.type} 세션에 참여하였습니다.`,
  );
};

export const getSessionByType = (userSessions, clientKey, type) => {
  const session = userSessions[clientKey];
  if (session && session.type) {
    return session;
  }
  return null;
};

export const getUserByUUID = (userSessions, uuid) => {
  // 하.. 반복을 돌 수 밖에 없을까..
  for (const [key, value] of Object.entries(userSessions)) {
    if (value.userId === uuid) {
      return key;
    }
  }
  return null;
};

export const getUserByClientKey = (userSessions, clientKey) => {
  return userSessions[clientKey] || null;
};
