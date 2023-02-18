const crypto = require("crypto");

const LIMIT_DAYS = 10;

const SECRETKEY = crypto.randomBytes(5).toString("hex");

module.exports = {
  LIMIT_DAYS,
  SECRETKEY,
};
