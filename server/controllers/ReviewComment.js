import mongoose from 'mongoose';
import { Schema } from 'mongoose';
export default mongoose.model(
    'Reviewcomment',
    new Schema({
        userId: {
            type: String,
            required: true,
            unique: false,
        },
        reviewId: {
            type: String,
            required: true,
            unique: false,
        },
        comment: {
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


