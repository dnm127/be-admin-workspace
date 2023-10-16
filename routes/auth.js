const express = require('express');
const bcrypt = require('bcrypt');

module.exports = function (app) {
  if (!app) {
    throw new Error('missing app');
  }

  const routerAuth = express.Router();

  app.use('/auth', routerAuth);

  routerAuth.post('/login', login);

  function login(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const hardCodeUserName = "mock-user";
    const hardCodePassword = "mock123";
    const saltRounds = 12;

    //TODO: Please hash the mock password with saltRounds = 12 and fill to hashPassword
    let hashPassword = "";
    if (hardCodeUserName === username) {
      hashPassword = bcrypt.hashSync(hardCodePassword, saltRounds);

      //TODO: Use the bcrypt to verify the req.body.username and req.body.password which should match the hashPassword above
      const validate = bcrypt.compareSync(password, hashPassword);
      if (validate) {
        res.status(200).send({ data: "Login successful" });
      } else {
        res.status(400).send({ data: "Invalid password" });
      }
    } else {
      res.status(400).send({ data: "Invalid username" });
    }
  }
};