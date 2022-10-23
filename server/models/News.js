//add schema for news model
import mongoose from "mongoose";
import { Schema } from "mongoose";

export default mongoose.model(
  "News",
  new Schema({
    title: {
      type: String,
      required: true,
      unique: false,
    },
    description: {
      type: String,
      required: true,
      unique: false,
    },
    image: {
      type: String,
      required: false,
      unique: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: false,
    },
    tags: {
      type: [String],
      required: false,
      unique: false,
    },
    reactions: {
      // reactions with emoji and count
      type: [Object],
      required: false,
      unique: false,
    },
    isLocked: {
      type: Boolean,
      required: false,
      unique: false,
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
