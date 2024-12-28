/** USER_DB 쿼리문 모임 스크립트 */

const USER_SQL_QUERIES = {
  FIND_USER: `SELECT * FROM users WHERE user_id = ?`,

  CREATE_USER: `INSERT INTO users (user_id, password, nickname) VALUES (?, ?, ?)`,

  UPDATE_USER_LOGIN: `UPDATE users SET last_Login = CURRENT_TIMESTAMP WHERE user_id = ?`,

  CREATE_USER_UUID: `UPDATE users SET uuid = ? WHERE user_id = ?`,

  UPDATE_USER_NICKNAME: `UPDATE users SET nickname = ? WHERE uuid = ?`,

  FIND_USER_BY_UUID: `SELECT * FROM users WHERE uuid = ?`,
};

export default USER_SQL_QUERIES;
