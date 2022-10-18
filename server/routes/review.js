import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const reviewRouter = express.Router();

//import controllers
import ReviewController from "../controllers/Review.js";

// create new instance of ReviewController
const review = new ReviewController();

// middleware
reviewRouter.use(async (req, res, next) => {
  if (req.session.user || req.originalUrl.includes("get-all-reviews")) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});


// write a review for a movie
reviewRouter.post("/write-review", async (req, res) => {
    try {
      const { review_content, title, image, imdb_id } = req.body;
      const user_id = req.session.user;
      const  data = { user_id, review_content, title, image, imdb_id };
      const response = await review.writeReview(data);
        return res.status(response.status).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  });
  

// get all reviews by movie id ...
reviewRouter.post("/get-all-reviews", async (req, res) => {
  try {
    // get all reviews from the controller review
    const { imdb_id, offset, limit } = req.body;
    if (!imdb_id) {
      return res.status(500).json({ message: "movie id is required" });
    }
    //get all reviews
    const reviews = await review.getAllReviews(imdb_id);
    // return all reviews
    return res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//upvote a review or a comment
reviewRouter.get("/add-upvote", async (req, res) => {
    try {
        const { review_id, comment_id } = req.body;
        const user_id = req.session.user;
        const data = { review_id, comment_id, user_id };
        const response = await review.addUpvote(data);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

//downvote a review or a comment
reviewRouter.get("/add-downvote", async (req, res) => {
    try {
        const { review_id, comment_id } = req.body;
        const user_id = req.session.user;
        const data = { review_id, comment_id, user_id };
        const response = await review.addDownvote(data);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});




// get all comments for a review by review id
reviewRouter.post("/get-all-comments", async (req, res) => {
  try {
    const { review_id, offset, limit } = req.body;
    if (!review_id) {
      return res.status(500).json({ message: "Review id is required" });
    }
    //get all comments for a review
    const comments = await review.getAllComments(review_id);
    // return all comments
    return res.status(200).json({ comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// write a comment for a review by the user ...
reviewRouter.post("/write-comment", async (req, res) => {
    try {
        const { review_id, comment } = req.body;
        const user_id = req.session.user;
        const data = { user_id, review_id, comment };
        const response = await review.writeComment(data);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});



// get all reactions for a review by review id
reviewRouter.get("/get-all-reactions", async (req, res) => {
  try {
    const { review_id } = req.query;
    if (!review_id) {
      return res.status(500).json({ message: "Review id is required" });
    }
    //get all reactions for a review
    const reactions = await review.getAllReactions(review_id);
    // return all reactions
    return res.status(200).json({ reactions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// add a reaction for a review by the user, or remove it if it already exists
reviewRouter.get("/add-reaction", async (req, res) => {
    try {
        const { review_id, reaction } = req.query;
        const user_id = req.session.user;
        const data = { user_id, review_id, reaction };
        const response = await review.addReaction(data);
        return res.status(response.status).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

export default reviewRouter;
