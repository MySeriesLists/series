import mongoose from "mongoose";
import { Schema } from "mongoose";

/**
 * @typedef {Object} Message
 * @property {string} sender
 * @property {string} receiver
 * @property {string} message
 * @property {Date} date
 */

export default mongoose.model("Actors", new Schema({
    imdbId : {
        type: String,
        required : true, 
        unique : true,
        max : 17,
    },
    name : {
        type: String,
        required : true,
        max : 23,
    },
    birthDate : {
        type: String,
        required : false,
        max : 13,
    },
    birthPlace : {
        type: String,
        required : false,
        max : 255,
    },
    description : {
        type: String,
        required : false,
        max : 2048,
    },
    filmography : {
        type: [Object],
        required : false,
        max : 2048,
    },
    images : {
        type: String,
        required : false,
        max : 255,
    },

}));


