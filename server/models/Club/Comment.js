//comment related to a discussion or an event of the club
import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import { User } from "../User.js";

export default mongoose.model(
    "ClubComment",
    new Schema({
        comment: {
            type: String,
            required: true,
            unique: false,
        },
        relatedTo: { // discussion or event
            type: Number, // if 0 then discussion, if 1 then event
            required: true,
            unique: false,
        },
        // person who created the comment
        creator: {
            type: String,
            required: true,
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

