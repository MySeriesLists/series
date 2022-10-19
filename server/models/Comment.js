import mongoose from "mongoose";
import { Schema } from "mongoose";

const Comments = mongoose.model(
  "Comments",
  new Schema({
    imdbId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    codeComment: {
      type: String,
      required: true,
    },
    upvotes: {
        type: [String],
    },
    downvotes: {
        type: [String],
    },
    replies: {
        type: [Object],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

  })
);

export default Comments;