import USER_SQL_QUERIES from '@peekaboo-ssr/modules-database/USER_QUERIES';

const findUser = async (database, id) => {
  const [rows] = await database.pools.USER_DB.query(
    USER_SQL_QUERIES.FIND_USER,
    [id],
  );
  return rows[0];
};

const createUser = async (database, id, password) => {
  await database.pools.USER_DB.query(USER_SQL_QUERIES.CREATE_USER, [
    id,
    email,
    password,
  ]);
  return { id, email, password };
};

const updateUserLogin = async (database, id) => {
  await database.pools.USER_DB.query(USER_SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
};

const createUserUuid = async (database, id, uuid) => {
  await database.pools.USER_DB.query(USER_SQL_QUERIES.CREATE_USER_UUID, [
    uuid,
    id,
  ]);
  return uuid;
};

const userCommands = {
  findUser,
  createUser,
  updateUserLogin,
  createUserUuid,
};

export default userCommands;
