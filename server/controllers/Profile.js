import axios from "axios";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { User } from "../models/User.js";

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) throw err;
});
// upload all data to mongodb
mongoose.connection.on("error", (err) => {
    console.log(err.message);
});


export default class Profile {
    constructor() {
        this.auth = axios.create({
            baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/auth",
            withCredentials: true,
        });
    }


    generateAuthToken(data) {
        const token = jwt.sign({ _id: data._id }, process.env.JWT_AUTH_KEY, { expiresIn: "1h" });
        return token;
    }  
   
   async profile(data) {
        if(!data) {
            return {error: "No data provided", status: 400};
        }
        console.log("data", data);
        
        const user = await User.findOne({ username: data }).select("-password").select("-email");
        console.log("user", user);
        return user;          
    }
    
}

