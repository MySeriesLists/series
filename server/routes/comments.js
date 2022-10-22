import epxress from "express";
import mongoose from "mongoose";
import Comment from "../controllers/Comment.js";
const commentController = new Comment();
const commentRouter = epxress.Router();

/**
 * @middleware  - check if user is logged in
 * @description - check if user is logged in
 * @param       - req, res, next
 * @returns     - next()
 */

commentRouter.use((req, res, next) => {
  if(req.originalUrl.includes('get-comments-movies')) {
    next();
  }
  if (!req.session.user) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.session.user)) {
    return res.status(400).send({ error: "Invalid user id" });
  }
  next();
});

/**
 * @route       - POST /
 * @description - test route
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 **/

commentRouter.get("/", (req, res) => {
  res.send("Hello from comment router");
});

/**
 * @route       - POST /post-create-comment
 * @description - create comment
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - movieId, comment
 * @bodyType    - string, string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a", "This is a comment"
 * @response    - {status: "success", comment: comment}
 * @responseType- {string, object}
 */ 

commentRouter.post("/add-comment", async (req, res) => {
  try {
      const {idOfCommentedItem, type, content} = req.body;
      const userId = req.session.user;

      const response = await commentController.addComment({idOfCommentedItem, type, userId, content});
      if(response.error) {
          return res.status(400).json({message: response.error});
      }
      console.log("response", response);
      res.status(200).json({message: response.comment});
  } catch (error) {
      res.status(500).json({message: error.message});
  }

});

/**
 * @route       - POST /edit-create-comment
 * @description - edit comment
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - commentId, comment
 * @bodyType    - string, string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a", "This is an updated comment"
 * @response    - {status: "success", comment: comment}
 * @responseType- {string, object}
 */

commentRouter.post("/edit-comment", async (req, res) => {
  try {
    const { commentId, content } = req.body;
    const response = await commentController.editComment({
      userId: req.session.user,
      content,
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

/**
 * @route       - POST /delete-comment-movies
 * @description - delete comment
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - commentId 
 * @bodyType    - string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a"
 * @response    - {status: "success", comment: comment}
 * @responseType- {string, object}
 * 
 */

commentRouter.delete("/delete-comment", async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.deleteComment({
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

/**
 * @route       - POST /upvote-comments-movies
 * @description - upvote comment
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - commentId
 * @bodyType    - string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a"
 * @response    - {status: "success", comment: comment}
 * @responseType- {string, object}
 */
commentRouter.post("/upvote-comment", async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.upvoteComment({
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

/**
 * @route       - POST /downvote-comments-movies
 * @description - downvote comment
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - commentId
 * @bodyType    - string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a"
 * @response    - {status: "success", comment: comment}
 * @responseType- {string, object}
 */

commentRouter.post("/downvote-comment", async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.downvoteComment({
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

/**
 * @route       - POST /get-comments-movies
 * @description - get comments
 * @param       - req, res
 * @returns     - res
 * @access      - public
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a"
 * @response    - {status: "success", comments: comments}
 * @responseType- {string, object}
 */
commentRouter.post("/get-comments", async (req, res) => {
  try {
    let { idOfCommentedItem } = req.body;
    if (!idOfCommentedItem) {
      return res.status(400).send({ error: "No data provided!" });
    }
    const response = await commentController.getComments({
      idOfCommentedItem,
      type,
    });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default commentRouter;
