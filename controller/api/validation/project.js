const Joi = require('@hapi/joi')

module.exports = Joi.object({
  _id: Joi.string().default(''),
  project_title: Joi.string().min(5).max(50).required(),
  project_domain: Joi.array().items(Joi.string()).required().max(10).max(500),
  project_description: Joi.string().min(10).required(),
  project_requirement: Joi.array().items(Joi.string()).required().max(10),
  requirement_description: Joi.string().required().min(10),
  project_members: Joi.array().items(Joi.string()).default([]),
  project_leader: Joi.string(),
  project_requests: Joi.array().items(Joi.string()).default([]),
  is_deleted: Joi.boolean().default(false),
  is_completed: Joi.boolean().default(false),
  teamExists: Joi.boolean().default(false),
})
