import mongoose from "mongoose";
import { Schema } from "mongoose";
export default mongoose.model(
  "MessageSchema",
  new Schema({
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
      max: 255,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  })
);
