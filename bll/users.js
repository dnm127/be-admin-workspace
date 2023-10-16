const _ = require("lodash");

module.exports = (app) => {
  async function getUsers(options) {
    const users = await app.dal.users.getUsers(options);

    return users;
  }

  async function createUser(body) {
    const newUsers = await app.dal.users.createUser(body);

    return newUsers;
  }

  return { getUsers, createUser };
};
