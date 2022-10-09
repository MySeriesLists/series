import axios from "axios";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import Profile from "../controllers/Profile.js";
import { User } from "../models/User.js";

const userProfile = new Profile();

const profile = express.Router();

profile.use(cookieParser());

profile.use( "/", (req, res, next) => {
    const token = req.cookies["auth-token"];
    const refreshToken = req.cookies["refresh-token"];
    if (!token && !refreshToken) {
        res.status(401).json({ message: "Unauthorized " });
        return;
    }
    if(token){
        jwt.verify(token, process.env.JWT_AUTH_KEY, (err, decodedRefresh) => {
            if (err) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const user =  userProfile.profile({ _id: decodedRefresh._id });
        });
    } else {
        if (refreshToken) {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, decodedRefresh) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                // generate new auth token
                const token =  userProfile.generateAuthToken({ _id: decodedRefresh._id });
                res.cookie("auth-token", token, { httpOnly: true }, { maxAge: 60 * 60 * 1000 });
                next();
            });

        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    }
    next();
});

profile.get("/:name", (req, res) => {
    const { name } = req.params;

    if (name) {
        userProfile
            .profile({ name })
            .then((response) => {
                res.json(response);
            })
            .catch((error) => {
                res.status(400).send(error);
            });
    } else {
        res.status(400).json({ message: "Invalid name" });
    }
});



profile.get("/me", async (req, res) => {
    res.status(200).json({
      redirect_url: "/profile",
    })
});

export default profile;