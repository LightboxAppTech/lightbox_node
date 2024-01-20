const mongoose = require('mongoose')
const { Boolean, ObjectId, String } = mongoose.Schema.Types

const PostSchema = new mongoose.Schema(
  {
    description: { type: String, minlength: 10, required: true },
    owner_id: { type: ObjectId, ref: 'User', required: true },
    // TODO: Maximum image elements should be less than 10
    post_image: { type: [String], default: [] },
    comments: [{ type: ObjectId, ref: 'Comment', required: false }],
    tags: { type: [String], default: [], required: true },
    upvotes: [{ type: ObjectId, ref: 'User', required: false }],
    sharing_link: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)
PostSchema.index({ description: 'text' })
module.exports = mongoose.model('Post', PostSchema)
