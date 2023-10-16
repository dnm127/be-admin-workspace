const express = require("express");

module.exports = function (app, middelwares) {
  if (!app) {
    throw new Error("missing app");
  }

  const routerUsers = express.Router();

  //TODO: Add Router-level middlewares

  //TODO: Add the Route-level middleware to response 401 if any falling through
  app.use("/users", routerUsers);

  //Get all users
  routerUsers.get("/", getUsers);
  async function getUsers(req, res, next) {
    try {
      // validation params if needed
      const options = req.query;
      const results = await app.bll.users.getUsers(options);

      return res.status(200).send(results);
    } catch (err) {
      return next(err);
    }
  }

  //Add new user
  routerUsers.post("/", createUser);
  async function createUser(req, res, next) {
    try {
      const body = req.body;
      const results = await app.bll.users.createUser(body);

      return res.status(200).send(results);
    } catch (err) {
      return next(err);
    }
  }

  //Get user
  routerUsers.get("/:id", getUserById);
  async function getUserById(req, res, next) {
    try {
      const id = req.params.id;
      const results = await app.bll.users.getUserById(id);
      return res.status(200).send(results);
    } catch (err) {
      return next(err);
    }
  }

  //Update user
  routerUsers.patch("/:id", updateUser);
  async function updateUser(req, res, next) {
    try {
      const id = req.params.id;
      const body = req.body;
      const results = await app.bll.users.updateUser(id, body);
      return res.status(200).send(results);
    } catch (err) {
      return next(err);
    }
  }

  //Delete user
  routerUsers.delete("/:id", deleteUser);
  async function deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      const results = await app.bll.users.deleteUser(id);
      return res.status(200).send(results);
    } catch (err) {
      return next(err);
    }
  }
};
