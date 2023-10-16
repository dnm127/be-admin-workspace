const _ = require("lodash");
const camelcaseKeys = require("camelcase-keys");

module.exports = (app) => {
  const db = app.pg;

  async function getUser(userId, dbClient = db) {
    if (!userId) {
      throw new Error("userId is required.");
    }

    const resultQuery = await getUsers({ userId }, dbClient);

    if (_.isEmpty(resultQuery.rows)) {
      throw new Error("User Not Found");
    }
    return camelcaseKeys(resultQuery.rows[0], { deep: true }); // { userId: 1, ... }
  }

  async function getUsers(options, dbClient = db) {
    const sqlWhere = [];
    const sqlParams = [];
    let sql = `
        SELECT u.user_id,
            u.username,
            u.email,
            u.kvp,
            u.date_created,
            u.date_modified,
            u.modified_by,
            u.last_logged_in,
            u.user_settings,
            u.status
        FROM public.sso_user u
    `;

    if (options.id) {
      sqlParams.push(options.id);
      sqlWhere.push(`u.user_id = $${sqlParams.length}`);
    }

    if (sqlWhere.length) {
      sql += " WHERE " + sqlWhere.join(" AND ");
    }

    if (Number.isInteger(options.limit)) {
      sql += ` LIMIT ${options.limit || 30}`;
    }
    if (Number.isInteger(options.offset)) {
      sql += ` OFFSET ${options.offset || 0}`;
    }

    const resultQuery = await dbClient.query(sql, sqlParams, (result) => {
      return camelcaseKeys(result.rows, { deep: true });
    });

    return {
      count: resultQuery.length,
      results: resultQuery,
      limit: options.limit || 30,
      offset: options.offset || 0,
    };
  }

  async function getUserOrganizations(userId, dbClient = db) {
    if (!userId) {
      throw new Error("userId is required.");
    }

    const sql = `
      SELECT 	so.organization_id,
          so.organization_name,
          so.status,
          so.address,
          so.contact_number,
          so.email,
          so.country,
          so.state,
          so.city,
          so.postal_code,
          so.website_url,
          so.date_created,
          so.date_modified
      FROM 	sso_organization_user sou
        INNER JOIN sso_organization so on so.organization_id = sou.organization_id 
      WHERE sou.user_id = $1;
    `;
    const sqlParams = [userId];
    const resultQuery = await dbClient.query(sql, sqlParams);

    return camelcaseKeys(resultQuery.rows, { deep: true });
  }

  async function createUser(body, dbClient = db) {
    let errorMessage = "";
    let count = 0;
    let sql = ``;
    const {
      username,
      password,
      email,
      kvp,
      modified_by,
      last_logged_in,
      user_settings,
      status,
    } = body;
    if (!username) {
      errorMessage += "username, ";
      count += 1;
    }
    if (!email) {
      errorMessage += "email, ";
      count += 1;
    }
    if (!password) {
      errorMessage += "password ";
      count += 1;
    }
    error =
      count === 0
        ? ``
        : count === 1
        ? error + " is required."
        : " are required.";

    sql += `
      INSERT INTO sso_user (
        user_id,
        username,
        password,
        email,
        status,
        kvp,
        modified_by,
        last_logged_in,
        user_settings
      )
      VALUES(
        uuid_generate_v4(),
        '${username}',
        '${password}',
        '${email}',
        '${status ? status : "active"}',
    `;
    if (kvp) {
      sql += `'${JSON.stringify(kvp)}',`;
    } else {
      sql += `'{}',`;
    }
    if (modified_by) {
      sql += `'${modified_by}',`;
    } else {
      sql += `NULL,`;
    }
    if (last_logged_in) {
      sql += `'${modified_by}',`;
    } else {
      sql += `NULL,`;
    }
    if (user_settings) {
      sql += `'${JSON.stringify(modified_by)}'`;
    } else {
      sql += `'{}'`;
    }
    sql += `);`;

    const resultQuery = await dbClient.query(sql);
    return camelcaseKeys(resultQuery.rows, { deep: true });
  }

  async function getUserById(userId, dbClient = db) {
    if (!userId) {
      throw new Error("userId is required");
    }

    let sql = `SELECT * FROM sso_user WHERE user_id = '${userId}'`;
    const resultQuery = await dbClient.query(sql);
    return camelcaseKeys(resultQuery.rows, { deep: true });
  }

  async function deleteUser(userId, dbClient = db) {
    if (!userId) {
      throw new Error("userId is required");
    }
    const exitingUser = await getUserById(userId, dbClient);
    if (exitingUser.length === 0) {
      throw new Error(`user with id ${userId} does not exist`);
    }
    let sql = `DELETE FROM sso_user WHERE user_id = '${userId}';`;
    const resultQuery = await dbClient.query(sql);
    return camelcaseKeys(resultQuery.rows, { deep: true });
  }

  async function updateUser(userId, body, dbClient = db) {
    const { username, password, email, kvp, user_settings, status } = body;
    if (!userId) {
      throw new Error("userId is required");
    }
    const exitingUser = await getUserById(userId, dbClient);
    if (exitingUser.length === 0) {
      throw new Error(`user with id ${userId} does not exist`);
    }
    let sql = ``;
    sql += `
      UPDATE sso_user SET
    `;

    if (username) {
      sql += `username = '${username}',`;
    }
    if (username) {
      sql += `password = '${password}',`;
    }
    if (email) {
      sql += `email = '${email}',`;
    }
    if (kvp) {
      sql += `kvp = '${JSON.stringify(kvp)}',`;
    }
    if (user_settings) {
      sql += `user_settings = '${JSON.stringify(user_settings)}',`;
    }
    if (email) {
      sql += `status = '${status}'`;
    }
    sql += `;`;

    const resultQuery = await dbClient.query(sql);
    return camelcaseKeys(resultQuery.rows, { deep: true });
  }

  return {
    getUser,
    getUsers,
    getUserOrganizations,
    createUser,
    getUserById,
    deleteUser,
    updateUser,
  };
};
