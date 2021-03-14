const Joi = require("@hapi/joi");

module.exports = Joi.object({
  email: Joi.string().min(6).max(100).email().required(),
  password: Joi.string().min(8).max(100).required(),
});
