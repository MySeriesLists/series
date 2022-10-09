import mongoose from "mongoose";
import { Schema } from "mongoose";
export default mongoose.model("Movie", new Schema({
    imdbId : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true,
        unique : false
    },
    year : {
        type : Number,
        required : true,
        unique : false
    },
    ageRestriction : {
        type : String,
        required : true,
        unique : false
    },
    type : {
        type : String,
        required : true,
        unique : false
    },
    duration : {
        type : Number,
        required : false,
        unique : false
    },
    genre : {
        type : String,
        required : false,
        unique : false
    },
    actors : {
        type : [Object],
        required : false,
        unique : false
    },

    description : {
        type : String,
        required : false,
        unique : false,
    },
    rating : {
        type : Number,
        required : false,
        unique : false
    },
    images : {
        type : String,
        required : false,
        unique : false
    },
    trailer : {
        type : String,
        required : false,
        unique : false
    },
    director : {
        type : String,
        required : false,
        unique : false
    },
    writer : {
        type : String,
        required : false,
        unique : false
    },
    stars : {
        type : String,
        required : false,
        unique : false
    },
    country : {
        type : String,
        required : false,
        unique : false
    },
    language : {
        type : String,
        required : false,
        unique : false
    },
    awards : {
        type : String,
        required : false,
        unique : false
    },
    metascore : {
        type : String,
        required : false,
        unique : false
    },
    boxOffice : {
        type : String,
        required : false,
        unique : false
    },
    production : {
        type : String,
        required : false,
        unique : false
    },
    website : {
        type : String,
        required : false,
        unique : false
    },
    response : {
        type : String,
        required : false,
        unique : false
    },
    comments : [{
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    }],
    likes : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],
    dislikes : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }

}));