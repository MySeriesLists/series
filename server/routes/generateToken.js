import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

async function connectToDB() {
    try {
        mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/auth", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(err);
    }
}

async function handleDBError() {
    mongoose.connection.on("error", (err) => {
        console.log(err.message);
    });
}

// verify if alreday connected to db
if (!mongoose.connection.readyState) {
    connectToDB();
    handleDBError();
}
const generateAuthToken = async (req, res, userId) => {    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
    }
    const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        session: {
            maxAge: 60 * 60 * 1000,
        },
        store: new MongoStore({
            mongoUrl: process.env.MONGODB_URI,
            touchAfter: 24 * 3600,
        }),
        signed: true,
    });
    sessionMiddleware(req, res, () => {
        req.session.user =  userId;
        return res.status(200).json({ message: "User logged in" });
    });
}

export default generateAuthToken;
