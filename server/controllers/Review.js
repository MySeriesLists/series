import axios from "axios";
import Review from "../models/Review.js";
import Movie from "../models/Movie.js";
import { User } from "../models/User.js";
import { ObjectId } from "mongoose";

export default class ReviewController {
  constructor() {
    this.auth = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/auth",
      withCredentials: true,
    });
  }

  // write a review by the user ...

  async writeReview(data) {
    try {
      const { user_id, review_content, title, image, imdb_id } = data;
      const user = await User.findOne({ _id: user_id });
      const movie = await Movie.findOne({ imdbId: imdb_id });
      console.log(user, movie);
      if (!user || !movie) {
        return { status: 404, message: "Content not found" };
      }
      if (!review_content || !title || !imdb_id) {
        return { status: 500, message: "All fields except image are required" };
      }

      // write reveiw in collection
      await Review.create({
        userId: user_id,
        review: review_content,
        title,
        image,
        imdbId: imdb_id,
      });
      console.log("review created");
      return { status: 200, message: "Review created" };
    } catch (error) {
      console.log(error);
      return { status: 500, message: error.message };
    }
  }

  // add comment to a review by the user ...
  async writeComment(data) {
    try {
      const { user_id, review_id, comment } = data;
      console.log("data", data);

      if (!user_id || !review_id || !comment) {
        return { error: "Please fill all the fields", status: 400 };
      }
      let user = await User.findOne({ _id: user_id });
      let review = await Review.findOne({ _id: review_id });
      if (!user || !review) {
        return {
          error: "an error occured while adding comment",
          status: 404,
        };
      }
      review.comments.push({
        userId: user_id,
        comment,
      });
      //update the review in the database
      await Review.updateOne({ _id: review_id }, { comments: review.comments });
      return { comments: review.comments, status: 200 };

      /*
      //add the comment to the review
      review.comments.push({ user_id, comment });
      await Review.updateOne({ _id: review_id }, { comments: review.comments });
      return { comments: review.comments, status: 200 };*/
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  // get all reviews by movie id ...
  async getAllReviews(imdb_id, offset, limit) {
    try {
      if (!imdb_id) {
        return { error: "Movie id is required", status: 400 };
      }
      !offset ? (offset = 0) : offset;
      !limit ? (limit = 10) : limit;

      //get all reviews by movie id and populate userId by _id from User collection
      let reviews = await Review.find({ imdbId: imdb_id }).select("-comments");
      console.log("reviews", reviews);
      let reviewsCount = reviews.length;
      let reviewsWithUser = await Promise.all(
        reviews.map(async (review) => {
          let user = await User.findOne({ _id: review.userId }).select(
            "username _id iamge"
          );
          review.upvotes = review.upvotes.flat().length;
          review.downvotes = review.downvotes.flat().length;
          return { ...review._doc, user };
        })
      );

      let nextPage = reviewsCount > limit ? limit + 10 : null;
      return { review: reviewsWithUser, nextPage: nextPage, status: 200 };
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  async getAllComments(review_id, offset, limit) {
    try {
      if (!review_id) {
        return { error: "Review id is required", status: 400 };
      }
      //get all comments by review id
      !offset ? (offset = 0) : offset;
      !limit ? (limit = 10) : limit;

      let comments = await Review.findOne({ _id: review_id })
        .select("comments")
        .skip(offset)
        .limit(limit);
      let commentsCount = comments.comments.length;
      let commentsWithUser = await Promise.all(
        comments.comments.map(async (comment) => {
          let user = await User.findOne({ _id: comment.userId }).select(
            "username _id iamge"
          );
          return { ...comments._doc, user };
        })
      );
      let nextPage = commentsCount > limit ? limit + 10 : null;
      return {
        comments: commentsWithUser,
        nextPage: nextPage,
        commentsCount,
        status: 200,
      };
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  //upvote a review or a comment
  async addUpvote(data) {
    try {
      const { user_id, review_id, comment_id } = data;
      if (!user_id || (!review_id && !comment_id)) {
        return { error: "Please fill all the fields", status: 400 };
      }
      let user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (review_id) {
        let review = await Review.findOne({ _id: review_id });
        if (!review) {
          return { error: "Review not found", status: 404 };
        }
        //check if the user has already upvoted the review
        let upvoted = review.upvotes.find((upvote) => upvote == user_id);
        if (upvoted) {
          return { error: "You have already upvoted this review", status: 400 };
        }
        //check if the user has already downvoted the review
        let downvoted = review.downvotes.find(
          (downvote) => downvote == user_id
        );
        if (downvoted) {
          //remove the downvote
          review.downvotes = review.downvotes.filter(
            (downvote) => downvote != user_id
          );
        }
        //add the upvote
        review.upvotes.push(user_id);
        //update the review in the database
        await Review.updateOne({ _id: review_id }, review);
        return { upvotes: review.upvotes, status: 200 };
      }
      if (comment_id) {
        let review = await Review.findOne({ "comments._id": comment_id });
        if (!review) {
          return { error: "Comment not found", status: 404 };
        }
        //get the comment
        let comment = review.comments.find(
          (comment) => comment._id == comment_id
        );
        //check if the user has already upvoted the comment
        let upvoted = comment.upvotes.find((upvote) => upvote == user_id);
        if (upvoted) {
          return {
            error: "You have already upvoted this comment",
            status: 400,
          };
        }
        //check if the user has already downvoted the comment
        let downvoted = comment.downvotes.find(
          (downvote) => downvote == user_id
        );
        if (downvoted) {
          //remove the downvote
          comment.downvotes = comment.downvotes.filter(
            (downvote) => downvote != user_id
          );
        }
        //add the upvote
        comment.upvotes.push(user_id);
        //update the review in the database
        await Review.updateOne({ "comments._id": comment_id }, review);
        return { upvotes: comment.upvotes, status: 200 };
      }
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  //downvote a review or a comment
  async addDownvote(data) {
    try {
      const { user_id, review_id, comment_id } = data;
      if (!user_id || (!review_id && !comment_id)) {
        return { error: "Please fill all the fields", status: 400 };
      }
      let user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (review_id) {
        let review = await Review.findOne({ _id: review_id });
        if (!review) {
          return { error: "Review not found", status: 404 };
        }
        //check if the user has already downvoted the review
        let downvoted = review.downvotes.find(
          (downvote) => downvote == user_id
        );
        if (downvoted) {
          return {
            error: "You have already downvoted this review",
            status: 400,
          };
        }
        //check if the user has already upvoted the review
        let upvoted = review.upvotes.find((upvote) => upvote == user_id);
        if (upvoted) {
          //remove the upvote
          review.upvotes = review.upvotes.filter((upvote) => upvote != user_id);
        }
        //add the downvote
        review.downvotes.push(user_id);
        //update the review in the database
        await Review.updateOne({ _id: review_id }, review);
        return { downvotes: review.downvotes, status: 200 };
      }
      if (comment_id) {
        let review = await Review.findOne({ "comments._id": comment_id });
        if (!review) {
          return { error: "Comment not found", status: 404 };
        }
        //get the comment
        let comment = review.comments.find(
          (comment) => comment._id == comment_id
        );
        //check if the user has already downvoted the comment
        let downvoted = comment.downvotes.find(
          (downvote) => downvote == user_id
        );
        if (downvoted) {
          return {
            error: "You have already downvoted this comment",
            status: 400,
          };
        }
        //check if the user has already upvoted the comment
        let upvoted = comment.upvotes.find((upvote) => upvote == user_id);
        if (upvoted) {
          //remove the upvote
          comment.upvotes = comment.upvotes.filter(
            (upvote) => upvote != user_id
          );
        }
        //add the downvote
        comment.downvotes.push(user_id);
        //update the review in the database
        await Review.updateOne({ "comments._id": comment_id }, review);
        return { downvotes: comment.downvotes, status: 200 };
      }
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  // get all reviews by review id
  async getAllReactions(review_id) {
    try {
      if (!review_id) {
        return { error: "Review id is required", status: 400 };
      }
      //get all reactions by review id
      let review = await Review.findOne({ _id: review_id });
      return { reactions: review.reactions, status: 200 };
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  // add reaction to a review by the user, or remove it if it already exists
  async addReaction(data) {
    try {
      const { user_id, review_id, reaction } = data;
      if (!user_id || !review_id || !reaction) {
        return { error: "Please fill all the fields", status: 400 };
      }
      let user = await User.findOne({ _id: user_id });
      let review = await Review.findOne({ _id: review_id });
      if (!user || !review) {
        return {
          error: "an error occured while adding reaction",
          status: 404,
        };
      }
      let reactions = review.reactions;
      //verify if reaction type already exist in the reactions array
      let reactionExist = reactions.find((item) => item.type === reaction);
      if (reactionExist) {
        //verify if the user already reacted to the review
        let userReaction = reactionExist.users.find(
          (item) => item.user_id === user_id
        );
        if (userReaction) {
          //if user already reacted to the review, remove the reaction
          reactionExist.users = reactionExist.users.filter(
            (item) => item.user_id !== user_id
          );
        }
        //if user didn't react to the review, add the reaction
        else {
          reactionExist.users.push({ user_id });
        }
      }
      //if reaction type doesn't exist in the reactions array, add the reaction
      else {
        reactions.push({ type: reaction, users: [{ user_id }] });
      }
      //update the review in the database
      await Review.updateOne({ _id: review_id }, { reactions: reactions });
      return { reactions, status: 200 };
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }
}
