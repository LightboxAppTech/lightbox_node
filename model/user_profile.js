const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema(
  {
    // this is actual reference of users ID
    uid: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
    },
    thumbnail_pic: { type: String, default: '' },
    branch: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    fname: {
      type: String,
      required: true,
      min: 2,
      max: 50,
      // index: "text",
    },
    lname: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    college: {
      type: String,
      required: true,
      min: 1,
      max: 250,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    skillset: {
      type: Array,
      required: false,
      default: [],
    },
    title: {
      type: String,
      required: true,
      min: 1,
      max: 250,
    },
    skill_rating: {
      type: Number,
      required: false,
      min: 1,
      max: 4,
      default: 0,
    },
    connections: {
      type: [mongoose.SchemaTypes.ObjectId],
      required: false,
      default: [],
    },
    teams: {
      type: [mongoose.SchemaTypes.ObjectId],
      required: false,
      default: [],
    },
    groups: {
      type: [mongoose.SchemaTypes.ObjectId],
      required: false,
      default: [],
    },
    // these are the request that i made
    requestsMade: {
      type: [mongoose.SchemaTypes.ObjectId],
      default: [],
      required: false,
    },
    // these are the requests that i received
    requestsReceived: {
      type: [mongoose.SchemaTypes.ObjectId],
      default: [],
      required: false,
    },
  },
  { timestamps: true }
)
userProfileSchema.index({ fname: 'text' })
module.exports = mongoose.model('UserProfile', userProfileSchema)
