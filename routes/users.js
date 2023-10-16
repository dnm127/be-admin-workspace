const express = require("express");

module.exports = function (app, middelwares) {
  if (!app) {
    throw new Error("missing app");
  }

  const routerUsers = express.Router();

  //TODO: Add Router-level middlewares

  //TODO: Add the Route-level middleware to response 401 if any falling through
  app.use("/users", routerUsers);

  //TODO: Add the routes for user model
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
};
