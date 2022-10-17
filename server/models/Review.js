// schema model for reviews
import mongoose from "mongoose";
import { Schema } from "mongoose";

export default mongoose.model(
  "Review",
  new Schema({
    imdbId: {
      type: String,
      required: true,
      unique: false,
    },
    userId: {
      type: String,
      required: true,
      unique: false,
    },
    rating: {
      type: Number,
      required: false,
      unique: false,
    },
    review: {
      type: String,
      required: true,
      unique: false,
    },
    title: {
      type: String,
      required: true,
      unique: false,
    },
    image: {
      type: String,
      required: false,
      unique: false,
    },
    // all the comments for this review
    comments: {
      type: [Object],
      required: false,
      unique: false,
    },
    reactions: {
      // reactions with emoji and count
      type: [Object],
      required: false,
      unique: false,
    },
    upvotes: {
      type: [String],
      required: false,
      unique: false,
    },
    downvotes: {
      type: [String],
      required: false,
      unique: false,
    },
    isLocked: {
      type: Boolean,
      required: false,
      unique: false,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  })
);
