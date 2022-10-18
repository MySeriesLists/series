import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const clubRouter = express.Router();

//import controllers
import ClubController from "../controllers/Club.js";

// create new instance of ClubController
const club = new ClubController();

clubRouter.use(async (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

// create a new club
clubRouter.post("/create-club", async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const user_id = req.session.user;
    const data = { name, description, image, user_id };
    const response = await club.createClub(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
});

// get all clubs
clubRouter.get("/get-all-clubs", async (req, res) => {
  try {
    const { offset, limit } = req.query;
    const clubs = await club.getAllClubs(offset, limit);
    return res.status(200).json({ clubs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// get a club by name
clubRouter.get("/get-club-by-name", async (req, res) => {
  try {
    //decode the name
    const name = decodeURIComponent(req.query.name);
    console.log(name);
    const clubByName = await club.getClubByName(name);
    return res.status(200).json({ clubByName });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//list all members of a club
clubRouter.get("/get-all-members", async (req, res) => {
  try {
    const { club_id } = req.query;
    console.log(club_id);
    const members = await club.getAllMembers(club_id);
    return res.status(200).json({ members });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//add a member to a club
clubRouter.post("/add-member", async (req, res) => {
  try {
    const { club_id } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_id };
    const response = await club.addMember(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//remove a member from a club
clubRouter.post("/remove-member", async (req, res) => {
  try {
    const { club_id, user_to_remove_id } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_to_remove_id, user_id };
    const response = await club.removeMember(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//list all admins of a club
clubRouter.get("/get-all-admins", async (req, res) => {
  try {
    const { club_id } = req.query;
    console.log(club_id);
    const admins = await club.getAllAdmins(club_id);
    return res.status(200).json({ admins });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//add an admin to a club
clubRouter.post("/add-admin", async (req, res) => {
  try {
    const { club_id, user_to_add_as_admin } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_to_add_as_admin, user_id };
    const response = await club.addAdmin(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//remove an admin from a club
clubRouter.post("/remove-admin", async (req, res) => {
  try {
    const { club_id, user_to_remove_as_admin } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_to_remove_as_admin, user_id };
    const response = await club.removeAdmin(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// ban a member from a club
clubRouter.post("/ban-member", async (req, res) => {
  try {
    const { club_id, user_to_ban } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_to_ban, user_id };
    const response = await club.banMember(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// unban a member from a club
clubRouter.post("/unban-member", async (req, res) => {
  try {
    const { club_id, user_to_unban } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_to_unban, user_id };
    const response = await club.unbanMember(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//list all banned members of a club
clubRouter.get("/get-all-banned-members", async (req, res) => {
  try {
    const { club_id } = req.query;
    console.log(club_id);
    const bannedMembers = await club.getAllBannedMembers(club_id);
    return res.status(200).json({ bannedMembers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//list all pending members of a club
clubRouter.get("/get-all-pending-members", async (req, res) => {
  try {
    const { club_id } = req.query;
    console.log(club_id);
    const pendingMembers = await club.getAllPendingMembers(club_id);
    return res.status(200).json({ pendingMembers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//approve a pending member of a club
clubRouter.post("/approve-pending-member", async (req, res) => {
  try {
    const { club_id, user_to_approve,approved } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_to_approve, user_id,approved };
    const response = await club.approvePendingMember(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// disable a club
clubRouter.post("/enable-disable-club", async (req, res) => {
  try {
    const { club_id, isEnabled } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_id, isEnabled };
    const response = await club.disableClub(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});


// write a discussion post for a club
clubRouter.post("/write-discussion-post", async (req, res) => {
  try {
    const { club_id, post_title, post_description } = req.body;
    const user_id = req.session.user;
    const data = { club_id, user_id, post_title, post_description };
    const response = await club.writeDiscussionPost(data);
    return res.status(response.status).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});


// get all discussion posts for a club
clubRouter.get("/get-all-discussion-posts", async (req, res) => {
  try {
    const { club_id } = req.query;
    console.log(club_id);
    const posts = await club.getAllDiscussionPosts(club_id);
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

export default clubRouter;
