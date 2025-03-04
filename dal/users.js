const _ = require('lodash');
const camelcaseKeys = require('camelcase-keys');

module.exports = (app) => {
  const db = app.pg;

  async function getUser(userId, dbClient = db) {
    if (!userId) {
      throw new Error('userId is required.');
    }

    const resultQuery = await getUsers({ userId }, dbClient);
    
    if (_.isEmpty(resultQuery.rows)) {
      throw new Error('User Not Found');
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
			sql += ' WHERE ' + sqlWhere.join(' AND ');
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
      offset: options.offset || 0
    }
  }

  async function getUserOrganizations(userId, dbClient = db) {
    if (!userId) {
      throw new Error('userId is required.');
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

  return { getUser, getUsers, getUserOrganizations };
};