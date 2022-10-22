import mongoose from "mongoose";
import { Schema } from "mongoose";

const Comments = mongoose.model(
  "Comments",
  new Schema({
    // generic id for all types of comments
    idOfCommentedItem: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    upvotes: {
        type: [String],
    },
    downvotes: {
        type: [String],
    },
    isEdited: {
      type: Boolean,
      default: false,
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