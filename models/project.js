const mongoose = require('mongoose')
const { Boolean, ObjectId, String } = mongoose.Schema.Types

const ProjectSchema = new mongoose.Schema(
  {
    project_leader: { type: ObjectId, ref: 'User', required: true },
    project_members: [{ type: ObjectId, ref: 'User', required: false }],
    project_title: { type: String, minlength: 5, required: true },
    // TODO: Maximum domain elements should be less than 10
    project_domain: { type: [String], required: true },
    project_description: { type: String, minlength: 10, required: true },
    project_requirement: { type: [String], required: true },
    project_requests: [{ type: ObjectId, ref: 'User', required: false }],
    requirement_description: { type: String, minlength: 10, required: true },
    teamExists: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    is_completed: { type: Boolean, default: false },
    comments: [{ type: ObjectId, ref: 'Comment', required: false }],
  },
  { timestamps: true }
)
ProjectSchema.index({ project_description: 'text' })
module.exports = mongoose.model('Project', ProjectSchema)
