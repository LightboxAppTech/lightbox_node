const Joi = require('joi')

module.exports = Joi.object({
  comment_text: Joi.string().max(500).min(1).required(),
  commentor_name: Joi.string().required(),
  commentor_pic: Joi.string(),
  comment_date: Joi.string(),
  commentor: Joi.string().required(),
})
