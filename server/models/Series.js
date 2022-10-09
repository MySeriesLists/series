import mongoose from "mongoose";
import { Schema } from "mongoose";

export default mongoose.model("Series", new Schema({
    imdbId : {
        type: String,
        required: true,
        unique: true,
        max : 17
    },
    title : {
        type: String,
        required: true,
        max : 255,
    },
    year : {
        type: String,
        required : false,
        max : 13,
    },
    ageRestriction : {
        type: String,
        required : false,
        max : 13,
    },
    type : {
        type: String,
        required : true,
        max : 13,
        unique : false,
    },
    // genre is an array of strings
    genre : {
        type: [String],
        required : false,
        max : 255,
    },
    // actos in array of json objects
    actors : {
        type: [Object],
        required : false,
        max : 2048,
    },
    description : {
        type: String,
        required : false,
        max : 2048,
    },
    rating : {
        type: Number,
        required : false,
        max : 5,
    },
    episodes : {
        type: Number,
        required : false,
        max : 2,
    },
    // example of json nested object
    //"seasons": {
    //"numerOfSeasons": 2,
    //  "seasons": [
    //        {}
    //    ]
    //},
    seasons : {
        type: Object,
        required : false,
        max : 2048,
    },
    //
    image : {
        type: String,
        required : false,
        max : 255,
    },
    trailer : {
        type: String,
        required : false,
        max : 255,
    },
}));



