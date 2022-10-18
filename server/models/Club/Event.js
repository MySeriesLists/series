//events for a club
import mongoose from "mongoose";
import { Schema, model } from "mongoose";

export default mongoose.model(
    "ClubEvent",
  new Schema({
    name: {
      type: String,
      required: true,
      unique: false,
    },
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
    date: {
      type: Date,
      required: true,
      unique: false,
    },
    // person who created the event
    creator: {
      type: [String],
      required: true,
      unique: false,
    },
    // all the members of the club who are attending the event
    members: {
      type: [String],
      required: false,
      unique: false,
    },
    // all the discussions of the club
    comments: {
      type: [Object],
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
