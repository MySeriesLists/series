//recommndation of user Schema
import mongoose from "mongoose";
import { Schema } from "mongoose";

export default mongoose.model(
  "Recommandation",
  new Schema({
    userId: {
      type: String,
      required: true,
      unique: false,
    },
    movieId: {
      type: String,
      required: true,
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
