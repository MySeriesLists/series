import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import Profile from "../controllers/Profile.js";

const userProfile = new Profile();

const profile = express.Router();

profile.get("/:name", (req, res) => {
    const { name } = req.params;

    if (name) {
        userProfile
            .profile({ name })
            .then((response) => {
                console.log("response", response);
                if (response.error) {
                    res.status(400).send(response.error);
                }
                res.status(200).send(response);
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