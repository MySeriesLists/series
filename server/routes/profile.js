import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import Profile from "../controllers/Profile.js";

const userProfile = new Profile();

const profile = express.Router();

profile.use((req, res, next) => {
  console.log("profile route");
  // if user is not logged in or user try to access other user profile page
  if (!req.session.user) {
    if (!req.url.includes("get-user-profile")) {
      return res.json({ error: "You are not logged in" });
    }
  }

  next();
});

/**
 * @param {string} name
 * @description Get user profile
 * @returns {Promise<{error: string}|{user: User}>}
 */

//to keep
profile.post("/get-user-profile", async (req, res) => {
  try {
    const { name } = req.body;
    let user_id = "";
    req.session.user ? (user_id = req.session.user) : (user_id = null);
    console.log("user_id", user_id);
    const data = { name, user_id };

    const response = await userProfile.profile(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.message);
  }
});

/**
 * @param {string} name
 * @param {string} code, category (watching, completed, favorites, watchList)
 * @param {int} next, next page
 * @description get list of movies, depending on the code
 * if code === "favorites" return favorites
 * if code === "completed" return completed
 * if code === "watching" return watching
 * if code === "watchList" return watchList
 * @returns {Promise<{error: string}|{user: User}>}
 */

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

profile.get("/add-friend", async (req, res) => {
  try {
    const { friendName } = req.query;
    const user_id = req.session.user;

    const data = { user_id, friendName };
    console.log("data", data);
    if (!friendName) {
      return res
        .status(400)
        .send({ error: "Invalid username", status: "error" });
    }
    const response = await userProfile.addFriend(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

//remove friend
profile.get("/remove-friend", async (req, res) => {
  try {
    const { friendName } = req.query;
    const user_id = req.session.user;
    const data = { user_id, friendName };
    if (!friendName) {
      return res
        .status(400)
        .send({ error: "Invalid username", status: "error" });
    }
    const response = await userProfile.removeFriend(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// get pending friend requests
profile.get("/pending-friends", async (req, res) => {
  try {
    const user_id = req.session.user;
    const data = { user_id };
    const response = await userProfile.getFriendRequests(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// list of friends
profile.get("/friends", async (req, res) => {
  try {
    const name = req.query.name;
    const response = await userProfile.getFriends({ name });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// accept friend request
profile.get("/accept-friend", async (req, res) => {
  try {
    const { friendName } = req.query;
    const user_id = req.session.user;
    const data = { user_id, friendName };
    if (!friendName) {
      return res
        .status(400)
        .send({ error: "Invalid username", status: "error" });
    }
    const response = await userProfile.acceptFriendRequest(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// reject friend request
profile.get("/reject-friend", async (req, res) => {
  try {
    const { friendName } = req.query;
    const user_id = req.session.user;
    const data = { user_id, friendName };
    if (!friendName) {
      return res
        .status(400)
        .send({ error: "Invalid username", status: "error" });
    }
    const response = await userProfile.rejectFriendRequest(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// update user name
profile.get("/update-user-name", async (req, res) => {
  try {
    const { name } = req.query;
    const user_id = req.session.user;
    const data = { user_id, name };
    if (!name) {
      return res
        .status(400)
        .send({ error: "Invalid username", status: "error" });
    }
    const response = await userProfile.updateUserName(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

//update user password
profile.get("/update-user-password", async (req, res) => {
  try {
    const { password } = req.query;
    const user_id = req.session.user;
    const data = { user_id, password };
    if (!password) {
      return res
        .status(400)
        .send({ error: "Invalid password", status: "error" });
    }
    const response = await userProfile.updateUserPassword(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// update user bio
profile.get("/update-user-bio", async (req, res) => {
  try {
    const { bio } = req.query;
    const user_id = req.session.user;
    const data = { user_id, bio };
    if (!bio) {
      return res.status(400).send({ error: "Invalid bio", status: "error" });
    }
    const response = await userProfile.updateUserBio(data);
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default profile;
