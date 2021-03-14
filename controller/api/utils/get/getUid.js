const jwt = require("jsonwebtoken");

module.exports = (token) => {
  if (!token) return undefined;
  return jwt.verify(token, process.env.SECRET);
};
