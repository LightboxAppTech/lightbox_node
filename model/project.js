const mongoose = require('mongoose')
const types = mongoose.SchemaTypes

const project = new mongoose.Schema(
  {
    project_leader: {
      type: types.ObjectId,
      required: true,
      ref: 'users',
    },
    project_members: {
      type: [types.ObjectId],
      default: [],
      ref: 'users',
    },
    project_title: {
      type: types.String,
      required: true,
      min: 5,
    },
    project_domain: {
      type: types.Array,
      required: true,
      max: 10,
    },
    project_description: {
      type: types.String,
      required: true,
      // index: "text",
      min: 10,
    },
    project_requirement: {
      type: types.Array,
      required: true,
    },
    project_requests: {
      type: [types.ObjectId],
      ref: 'users',
      default: [],
    },
    requirement_description: {
      type: types.String,
      min: 10,
      required: true,
    },
    teamExists: {
      type: types.Boolean,
      default: false,
    },
    is_deleted: {
      default: false,
      type: types.Boolean,
    },
    is_completed: {
      default: false,
      type: types.Boolean,
    },
    comments: {
      default: [],
      type: types.Array,
    },
  },
  { timestamps: true }
)
project.index({ project_description: 'text' })
module.exports = mongoose.model('projects', project)
