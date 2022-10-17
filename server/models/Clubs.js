// club model schema with admin and members
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

export default mongoose.model('Club', new Schema({
    name : {
        type : String,
        required : true,
        unique : false
    },
    description : {
        type : String,
        required : true,
        unique : false
    },
    image : {
        type : String,
        required : false,
        unique : false
    },
    members : {
        type : [Object],
        required : false,
        unique : false
    },
    admin : {
        type : [Object],
        required : true,
        unique : false
    },
    topics : {     // topics related to the club
        type : [Object],
        required : false,
        unique : false
    },
    createdAt : {
        type : Date,
        required : true,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        required : true,
        default : Date.now
    },
}));

