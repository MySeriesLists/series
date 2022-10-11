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

profile.post("/movies-list", async (req, res) => {
  try {
    let { name, code, next } = req.body;
    !next ? (next = 0) : (next = next);
    if (!name) return res.status(400).send({ error: "Invalid username" });

    const response = await userProfile.moviesList({ name, code, next });

    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

profile.get("/add-follower/:name", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(400)
        .send({ error: "You must be logged in to follow a user" });
    }
    const { name } = req.params;
    if (!name) return res.status(400).send({ error: "Invalid username" });
    //verify if user exists and if user is not the same as the logged in user
    const response = await userProfile.addFollower({
      name,
      userId: req.session.user,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

profile.get("/remove-follower/:name", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(400)
        .send({ error: "You must be logged in to follow a user" });
    }
    const { name } = req.params;
    if (!name) return res.status(400).send({ error: "Invalid username" });
    //verify if user exists and if user is not the same as the logged in user
    const response = await userProfile.removeFollower({
      name,
      userId: req.session.user,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

profile.get("/followers/:name", async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).send({ error: "Invalid username" });
    const response = await userProfile.followers(name);
    if (response.error) {
      return res.status(400).send(response);
    }
    var followers = await response.followers;
    var following = await response.followings;
    console.log("following", following);

    
    return res.status(200).send({ followers, following });
  } catch (error) {
    console.log("error", error);
    return res.status(400).send(error.message);
  }
});

export default profile;
