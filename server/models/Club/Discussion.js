// all the discussion related to a club
import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import { User } from "../User.js";

export default mongoose.model(
  "ClubDiscussion",
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
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      unique: false,
    },
    // person who created the discussion
    creator: {
      type: String,
      required: true,
      unique: false,
    },
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
