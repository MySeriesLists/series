import { UsersProfileComments, MoviesComments } from "../models/Comment.js";
import { User } from "../models/User.js";
import Movie from "../models/Movie.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export default class Comment {
  /**
   * @param {string} userId
   * @param {string} imdbId
   * @param {string} comment
   * @returns {Promise<{error: string}|{user: User}>}
   * @memberof Comment
   * @description Comment on a movie
   * @example
   * const comment = new Comment();
   * comment.comment({ userId: "123", movieId: "123", comment: "This movie is great" })
   * .then((response) => {
   *   console.log("response", response);
   *  if (response.error) {
   *   res.status(400).send(response.error);
   *  }
   * res.status(200).send(response);
   * }).catch((error) => {
   * console.log("error", error);
   * });
   */
  async postCommentMovies({ userId, imdbId, comment }) {
    try {
      const user = await User.findById(userId);
      const movie = await Movie.findOne({ imdbId: imdbId });
      if (!user || !movie) {
        return { error: "User or movie not found", status: 404 };
      }

      const newComment = new MoviesComments({
        userId,
        imdbId,
        comment,
      });
      await newComment.save();
      return { comment: newComment };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} userId
   * @param {string} imdbId
   * @param {string} comment
   * @param  {string} commentId
   * @description edit a comment, created by the user
   * @returns {Promise<{error: string}|{user: User}>}
   * @memberof Comment
   * @example
   * const comment = new Comment();
   * comment.editCommentMovies({ userId: "123", movieId: "123", comment: "This movie is great" })
   * .then((response) => {
   *  console.log("response", response);
   * if (response.error) {
   * res.status(400).send(response.error);
   * }
   *
   * res.status(200).send(response);
   * }).catch((error) => {
   * console.log("error", error);
   * });
   */
  async editCommentMovies({ userId, imdbId, comment, commentId }) {
    try {
      const user = await User.findById(userId);
      const movie = await Movie.findOne({ imdbId: imdbId });
      if (!user || !movie) {
        return { error: "User or movie not found", status: 404 };
      }

      const commentToEdit = await MoviesComments.findById(commentId);
      if (commentToEdit.userId !== userId) {
        return {
          error: "You are not allowed to edit this comment",
          status: 403,
        };
      }

      const editedComment = await MoviesComments.findByIdAndUpdate(
        commentId,
        {
          comment,
        },
        { new: true }
      );
      return { comment: editedComment };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} userId
   * @param {string} commentId
   * @description delete a comment, created by the user
   * @returns {Promise<{error: string}|{user: User}>}
   */
  async deleteCommentMovies({ userId, commentId }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const commentToDelete = await MoviesComments.findById(commentId);
      if (commentToDelete.userId !== userId) {
        return {
          error: "You are not allowed to delete this comment",
          status: 403,
        };
      }

      await MoviesComments.findByIdAndDelete(commentId);
      return { message: "Comment deleted" };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} userId
   * @param {string} commentId
   * @description upvote a comment,
   */
  async upvoteCommentMovies({ userId, commentId }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const commentToUpvote = await MoviesComments.findById(commentId);
      console.log("commentToUpvote", commentToUpvote.upvotes);

      if (commentToUpvote.upvotes.includes(userId)) {
        return {
          error: "You have already upvoted this comment",
          status: 403,
        };
      }
      commentToUpvote.upvotes.push(userId);

      // remove the user from the downvotes array
      commentToUpvote.downvotes = commentToUpvote.downvotes.filter(
        (downvote) => downvote !== userId
      );
      if (commentToUpvote.downvotes.includes(userId)) {
        commentToUpvote.downvotes = commentToUpvote.downvotes.filter(
          (downvote) => downvote !== userId
        );
      }
      await commentToUpvote.save();
      return { comment: commentToUpvote };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} userId
   * @param {string} commentId
   * @description downvote a comment,
   * @returns {Promise<{error: string}|{user: User}>}
   * @memberof Comment
   */
  async downvoteCommentMovies({ userId, commentId }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const commentToDownvote = await MoviesComments.findById(commentId);
      if (commentToDownvote.downvotes.includes(userId)) {
        return {
          error: "You have already downvoted this comment",
          status: 403,
        };
      }
      commentToDownvote.downvotes.push(userId);

      // remove the user from the upvotes array
      commentToDownvote.upvotes = commentToDownvote.upvotes.filter(
        (upvote) => upvote !== userId
      );
      if (commentToDownvote.upvotes.includes(userId)) {
        commentToDownvote.upvotes = commentToDownvote.upvotes.filter(
          (upvote) => upvote !== userId
        );
      }
      await commentToDownvote.save();
      return { comment: commentToDownvote };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} imdbId, the movie imdbId
   * @description get all comments for a movie, limit to 10
   * @returns {Promise<{error: string}|{user: User}>}
   */
    async getCommentsMovies(imdbId) {

        try {
            const comments = await MoviesComments.find({ imdbId: imdbId })
            .limit(10)
            .sort({ createdAt: -1 })
            .populate("userId", "username");
            return { comments };
        } catch (error) {
            return { error: error.message };
        }
        }
}
