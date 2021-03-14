const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      min: 10,
    },
    // owner_id is for person who wrote the post
    owner_id: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    post_image: {
      type: Array,
      required: false,
      max: 10,
      default: [],
    },
    comments: {
      type: mongoose.Schema.Types.Array,
      default: [],
    },
    tags: {
      type: Array,
      required: true,
      default: [],
      contentType: String,
    },
    upvotes: {
      type: mongoose.Schema.Types.Array,
      contentType: mongoose.Schema.Types.ObjectId,
      default: [],
    },
    sharing_link: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
postSchema.index({ description: "text" });
module.exports = mongoose.model("Post", postSchema);
