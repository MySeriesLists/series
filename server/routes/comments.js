import epxress from "express";
import mongoose from "mongoose";
import Comment from "../controllers/Comment.js";
const commentController = new Comment();
const commentRouter = epxress.Router();

commentRouter.use((req, res, next) => {
  console.log("Time: ", Date.now());
  if (!req.session.user) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.session.user)) {
    return res.status(400).send({ error: "Invalid user id" });
  }
  next();
});

commentRouter.get("/", (req, res) => {
  res.send("Hello from comment router");
});

commentRouter.post("/post-comment-movies", async (req, res) => {
  try {
    const { comment, imdbId } = req.body;
    if (!comment || !imdbId) {
      return res.status(400).send({ error: "No data provided!" });
    }

    const response = await commentController.postCommentMovies({
      userId: req.session.user,
      comment,
      imdbId,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

commentRouter.patch("/edit-comment-movies", async (req, res) => {
  try {
    const { comment, imdbId, commentId } = req.body;
    if (!comment || !imdbId || !commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.editCommentMovies({
      userId: req.session.user,
      comment,
      imdbId,
      commentId,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

commentRouter.delete("/delete-comment-movies", async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.deleteCommentMovies({
      userId: req.session.user,
      commentId,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

commentRouter.post("/upvote-comment-movies", async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.upvoteCommentMovies({
      userId: req.session.user,
      commentId,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

commentRouter.post("/downvote-comment-movies", async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.downvoteCommentMovies({
      userId: req.session.user,
      commentId,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

commentRouter.post('/get-comments-movies', async (req, res) => {
    try {
        const { imdbId } = req.body;
        if(!imdbId) {
            return res.status(400).send({ error: "No data provided!" });
        }

        
        const  response = await commentController.getCommentsMovies(imdbId );
        if(response.error) {
            return res.status(400).send(response);
        }
        return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send(error.message);
    }
});

export default commentRouter;
