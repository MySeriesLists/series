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
    // user can join automatically if they are invited, or need to be approved
    autoJoin : {
        type : Boolean,
        required : false,
        unique : false,
        default : true
    },
    pendigMembers : {
        type : [Object],
        required : false,
        unique : false
    },
    admins : {
        type : [Object],
        required : true,
        unique : false
    },
    banned : {
        type : [Object],
        required : false,
        unique : false
    },
    topics : {     // topics related to the club
        type : [Object], //id of the discussion or event
        required : false,
        unique : false
    },
    logo : {
        type : String,
        required : false,
        unique : false
    },
    disabled : {
        type : Boolean,
        required : false,
        unique : false,
        default : false
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

