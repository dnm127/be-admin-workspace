const _ = require("lodash");

module.exports = function middlewares() {
  function middlewareCorsHeader(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, DELETE, PATCH, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      next();
    }

    next();
    return;
  }

  return { middlewareCorsHeader };
};
