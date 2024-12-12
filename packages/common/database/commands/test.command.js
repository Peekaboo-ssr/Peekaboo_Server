const testDBConnection = async (pool, dbName) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log(`${dbName} 테스트 쿼리 결과:`, rows[0].solution);
  } catch (error) {
    console.error(`${dbName} 테스트 쿼리 실행 중 오류 발생`, error);
  }
};

const testAllDBConnection = (database) => {
  testDBConnection(database.pools.USER_DB, 'PEEKABOO_USER_DB');
  testDBConnection(database.pools.GAME_DB, 'PEEKABOO_GAME_DB');
};

const testCommands = {
  testAllDBConnection,
  testDBConnection,
};

export default testCommands;
