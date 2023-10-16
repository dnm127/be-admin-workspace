const _ = require("lodash");
const bcrypt = require("bcrypt");

module.exports = (app) => {
  async function getUsers(options) {
    const users = await app.dal.users.getUsers(options);

    return users;
  }

  async function createUser(body) {
    const SALT_ROUND = Number(process.env.SALT_ROUND);
    body.password = bcrypt.hashSync(body.password, SALT_ROUND);
    const newUsers = await app.dal.users.createUser(body);
    return newUsers;
  }

  async function getUserById(id) {
    const user = await app.dal.users.getUserById(id);

    return user;
  }

  async function deleteUser(id) {
    const deletedUser = await app.dal.users.deleteUser(id);

    return deletedUser;
  }

  async function updateUser(id, body) {
    const SALT_ROUND = Number(process.env.SALT_ROUND);
    body.password = bcrypt.hashSync(body.password, SALT_ROUND);
    const updatedUser = await app.dal.users.updateUser(id, body);

    return updatedUser;
  }

  return { getUsers, createUser, getUserById, deleteUser, updateUser };
};
