import mysql from 'mysql2/promise';
import config from '@peekaboo-ssr/config/shared';

class DatabaseManager {
  static gInstance = null;
  pools = {};

  constructor() {
    const { databases } = config;

    this.createPool('USER_DB', databases.USER_DB);
    this.createPool('GAME_DB', databases.GAME_DB);
  }

  static GetInstance() {
    if (DatabaseManager.gInstance === null) {
      DatabaseManager.gInstance = new DatabaseManager();
    }

    return DatabaseManager.gInstance;
  }

  createPool(poolName, dbConfig) {
    const pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const originalQuery = pool.query;

    pool.query = async (sql, params) => {
      const date = new Date();
      console.log(
        `[${this.formatDate(date)}] Executing query: ${sql} ${
          params ? `, ${JSON.stringify(params)}` : ``
        }`,
      );

      const result = await originalQuery.call(pool, sql, params);
      return result;
    };

    this.pools[poolName] = pool;
  }

  formatDate(date) {
    const year = date.getFullYear();

    // padStart는 한자리 수가 나올경우 앞을 0으로 채워주는 함수
    // 예) 1 -> 01
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
export default DatabaseManager.GetInstance();
