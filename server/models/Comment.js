import mongoose from "mongoose";
import { Schema } from "mongoose";


const UsersProfileComments = mongoose.model(
  "UsersProfileComments",
  new Schema({    
    userId: {
      type: String,
      required: true,
    },
    commenterUserId: {
        type : String,
        required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  })
);
const MoviesComments = mongoose.model(
  "MoviesComments",
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
    date: {
      type: Date,
      default: Date.now,
    },
    upvotes: {
        type: [String],
    },
    downvotes: {
        type: [String],
    },

  })
);

export { UsersProfileComments, MoviesComments };