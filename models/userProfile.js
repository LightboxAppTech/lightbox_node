const mongoose = require('mongoose')
const { Number, ObjectId, String } = mongoose.Schema.Types

const UserProfileSchema = new mongoose.Schema(
  {
    uid: { type: ObjectId, ref: 'User', required: true },
    thumbnail_pic: { type: String, default: null },
    branch: { type: String, required: true },
    fname: { type: String, minlength: 2, maxlength: 50, required: true },
    lname: { type: String, minlength: 2, maxlength: 50, required: true },
    college: { type: String, minlength: 1, maxlength: 250, required: true },
    semester: { type: Number, min: 1, max: 8, required: true },
    skillset: { type: [String], default: [] },
    title: { type: String, minlength: 1, maxlength: 250, required: true },
    skill_rating: { type: Number, min: 0, max: 5, default: 0 },
    connections: [{ type: ObjectId, ref: 'User', required: false }],
    // TODO: Need to update the model reference (User -> Team)
    teams: [{ type: ObjectId, ref: 'User', required: false }],
    // TODO: Need to update the model reference (User -> Group)
    groups: [{ type: ObjectId, ref: 'User', required: false }],
    requestsMade: [{ type: ObjectId, ref: 'User', required: false }],
    requestsReceived: [{ type: ObjectId, ref: 'User', required: false }],
  },
  { timestamps: true }
)
UserProfileSchema.index({ fname: 'text' })
module.exports = mongoose.model('UserProfile', UserProfileSchema)
