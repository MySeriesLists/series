import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import Profile from "../controllers/Profile.js";

const userProfile = new Profile();

const profile = express.Router();


profile.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const response = await userProfile.profile({ name });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

profile.post('/movies-list', async (req, res) => {
    try {
        const { name, code, next } = req.body;
        
        if(!name) {
            return res.status(400).send({ error: "Invalid username" });
        }
        const response = await userProfile.moviesList({ name, code });

        if (response.error) {
            return res.status(400).send(response);
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(400).send(error.message);
    }
});


export default profile;
