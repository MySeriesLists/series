import Comment from "../models/Comment.js";
import { User } from "../models/User.js";
import Movie from "../models/Movie.js";
import Blog from "../models/Blogs/Blog.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: "../.env" });

export default class CommentController {
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
  async addComment({idOfCommentedItem, type, userId, content }) {
    try {
      if(!userId || !content || !idOfCommentedItem || !type) {
        return {error: "Please provide all the required fields"};
      }
      // verify if idOfCommentedItem is a valid id
      if(!mongoose.Types.ObjectId.isValid(idOfCommentedItem)) {
        return {error: "Invalid idOfCommentedItem"};
      }
      const user = await User.findById({ _id: userId });
      if (!user) {
        return { error: "User not found" };
      }
            // all types of comments, profiles, movies, clubs, discussionsClub etc..
      const types = [
        "profile",
        "movie",
        "clubDiscussion",
        "clubEvent",
        "review",
        "blog",
      ];
      // check if the comment type is valid
      if (!types.includes(type)) {
        return { error: "Invalid comment type" };
      }

      const newComment = new Comment({
        idOfCommentedItem,
        userId,
        content,
        type,
      });
      await newComment.save();
      return { comment: newComment };
    } catch (error) {
      console.log("error", error);
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
  async editComment({ userId, content,  commentId }) {
    try {
      console.log("userId", userId);
      console.log("commentId", commentId);
      console.log("content", content);
      if(!commentId || !userId || !content) {
        return { error: "No data provided!" };
      }
      const user = await User.findById({ _id: userId });
      if (!user ) {
        return { error: "User or movie not found", status: 404 };
      }

      const commentToEdit = await Comment.findById(commentId);
      if (commentToEdit.userId !== userId) {
        return {
          error: "You are not allowed to edit this comment",
          status: 403,
        };
      }
      // update the comment and save it in the database
    commentToEdit.content = content;
    commentToEdit.isEdited = true;
    await commentToEdit.save();   
      return { comment: commentToEdit };
    } catch (error) {
      console.log("error", error);
      return { error: error.message };
    }
  }

  /**
   * @param {string} userId
   * @param {string} commentId
   * @description delete a comment, created by the user
   * @returns {Promise<{error: string}|{user: User}>}
   */
  async deleteComment({ userId, commentId }) {
    try {
      console.log("userId", userId);
      console.log("commentId", commentId);
      const user = await User.findById({ _id: userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const commentToDelete = await Comment.findById(commentId); 
      //only admin or the user who created the comment can delete it
      if(commentToDelete.userId !== userId || user.role !== "admin") {
        return {
          error: "You are not allowed to delete this comment",
          status: 403,
        };
      }

      await Comment.findByIdAndDelete(commentId);
      return { message: "Comment deleted" };
    } catch (error) {
      console.log("error", error);
      return { error: error.message };
    }
  }

  /**
   * @param {string} userId
   * @param {string} commentId
   * @description upvote a comment,
   */
  async upvoteComment({ userId, commentId }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const commentToUpvote = await Comment.findById(commentId);
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
      return { status: 200, message: "success" };
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
  async downvoteComment({ userId, commentId }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const commentToDownvote = await Comment.findById(commentId);
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
      return { status: 200, message: "success" };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} imdbId, the movie imdbId
   * @description get all comments for a movie, limit to 10
   * @returns {Promise<{error: string}|{user: User}>}
   */
  async getComments({idOfCommentedItem,  offset, limit}) {
    try {
      !offset && (offset = 0);
      !limit && (limit = 10);
      console.log(idOfCommentedItem, offset, limit);
      const comments = await Comment.find({idOfCommentedItem})
      console.log("comments", comments);

      // only return upvotes and downvotes count
      const commentsWithVotes = comments.map((comment) => {
        return {
          _id: comment._id,
          comment: comment.comment,
          userId: comment.userId,
          createdAt: comment.createdAt,
          upvotes: comment.upvotes.length,
          downvotes: comment.downvotes.length,
        };
      });
      let next = ""
      next = next + 10 > commentsWithVotes.length ? null : next + 10;

      return { comments: commentsWithVotes, next: next };
    } catch (error) {
      console.log("error", error);
      return { error: error.message };
    }
  }
/*
  async getQuery(type, idOfCommentedItem) {
    const typesAllowed = ["blogs", "movie", "events", "news", "discussions"];
    if (!typesAllowed.includes(type)) {
      return { error: "Invalid type", status: 400 };
    }

    let searchQuery = "";

    switch (type) {
      case "blogs":
        searchQuery = await Comment.find({
         idOfCommentedItem,
          type: "blog",
        });
      case "movie":
        searchQuery = await Comment.find({
          idOfCommentedItem,
          type: "movie",
        });
      case "events":
        searchQuery = await Comment.find({
          idOfCommentedItem,
          type: "event",
        });
      case "news":
        searchQuery = await Comment.find({
          idOfCommentedItem,
          type: "news",
        });
      case "discussions":
        searchQuery = await Comment.find({
          idOfCommentedItem,
          type: "discussion",
        });
      default:
        break;
    }
    return searchQuery;
  }*/
}
