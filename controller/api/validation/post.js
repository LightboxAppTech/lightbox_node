const Joi = require('joi')

module.exports = Joi.object({
  description: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string()).default([]),
  upvotes: Joi.array().default([]),
  comments: Joi.array().items(Joi.object()).default([]),
  _id: Joi.string().default(''),
  images: Joi.array().max(10).items(Joi.object()).default([]),
  is_deleted: Joi.boolean().default(false),
})
