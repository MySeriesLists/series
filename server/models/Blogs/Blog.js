//blogs for user 
import mongoose from "mongoose";
const { Schema, model } = mongoose;

export default model(
    "Blog",
    new Schema({
        userId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
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
        relatedMovies: {
            type: Array,
            default: [],
        },
    })
);
