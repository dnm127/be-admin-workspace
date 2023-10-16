const pg = require('pg');
const _ = require('lodash');

module.exports = () => {
  const pool = new pg.Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
  });

  async function query(sql, params, mapFunc, dbTrans) {
    const transClient = _.isObject(dbTrans) ? dbTrans : await pool.connect();

    try {
      const dbResults = await transClient.query(sql, params);

      return _.isFunction(mapFunc) ? mapFunc(dbResults) : dbResults; 
    } catch (err) {
      console.log('Error on query to Database', err);
      throw err;
    } finally {
      if (!_.isObject(dbTrans)) {
        transClient.release();
      }
    }
  }

  async function createTrans() {
    const client = await pool.connect();

    return {
      query: async (sql, params, mapFunc) => {
        return await query(sql, params, mapFunc, client);
      },
      release: () => client.release()
    }
  }

  pool.on('connect', (client) => {
    console.log('A new transaction has been created.');
  });

  return {query, createTrans};
}