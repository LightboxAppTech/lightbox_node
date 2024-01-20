const Joi = require('joi')

module.exports = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z ]*$/)
    .required(),
  college: Joi.string().min(1).max(250).required(),
  semester: Joi.number().integer().min(1).max(8).required(),
  skillset: Joi.array().min(1).required().items(Joi.string()),
  title: Joi.string().min(1).max(75).required(),
  branch: Joi.string().required(),
})
