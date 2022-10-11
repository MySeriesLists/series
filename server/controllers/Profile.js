import axios from "axios";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export default class Profile {
  constructor() {
    this.auth = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/auth",
      withCredentials: true,
    });
  }

  /**
   * @param {string} name
   * @returns {Promise<{error: string}|{user: User}>}
   * @memberof Profile
   * @describe Get user profile
   * @example
   * const userProfile = new Profile();
   * userProfile.profile({ name: "John" })
   * .then((response) => {
   *    console.log("response", response);
   *   if (response.error) {
   *    res.status(400).send(response.error);
   *  }
   * res.status(200).send(response);
   */
  async profile({ name }) {
    try {
      const user = await User.findOne({ username: name });

      if (!user) {
        return { error: "User not found", status: 404 };
      }

      const {
        username,
        _id,
        image,
        favorites,
        completed,
        watching,
        watchList,
      } = user;

      return {
        user: {
          username,
          _id,
          image,
          favorites: favorites.length,
          completed: completed.length,
          watching: watching.length,
          watchList: watchList.length,
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} code, category (watching, completed, favorites, watchList)
   * @param {string} name, username
   * @next {int} next, next page
   * @describe get list of movies, depending on the code
   * if code === "favorites" return favorites
   * if code === "completed" return completed
   * if code === "watching" return watching
   * if code === "watchList" return watchList
   * @returns {Promise<{error: string}|{movies: Array}>}
   *
   */
  async moviesList(data) {
    try {
      let { code, name, next } = data;
      console.log("code", code);
      console.log("name", name);
      !code ? (code = "watching") : (code = code);
      !next ? (next = 0) : (next = next);
      console.log("code", code);
      const user = await User.findOne({ username: name });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const lists = await User.find({ username: data.name })
        .select(code)
        .limit(10)
        .skip(next);
      let movies = [];

      lists.forEach((list) => {
        list[code].forEach((movie) => {
          movies.push(movie.imdbId);
        });
      });

      return { movies };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} name, username
   * @param {userId}, logged in user
   * @describe add user to the following list
   * @returns {Promise<{error: string}|{user: User}>}
   */
  async addFollower(data) {
    try {
      const { name, userId } = data;
      const user = await User.findOne({ username: name });
      const hexId = user._id.toString(); // why is this necessary?
      if (!user || hexId === userId) {
        return { error: "User not found", status: 404 };
      }
      const following = await User.findOneAndUpdate(
        { username: name },
        { $addToSet: { followers: userId } },
        { new: true }
      );
      const followers = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { following: user._id.toString() } },
        { new: true }
      );
      return { message: "User added to following list" };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} name, (userId logged in user)
   * @describe remove user from the following list
   * @returns {Promise<{error: string}|{user: User}>}
   */
  async removeFollower(data) {
    try {
      const { name, userId } = data;
      const user = await User.findOne({ username: name });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const following = await User.findOneAndUpdate(
        { username: name },
        { $pull: { followers: userId } },
        { new: true }
      );
      const followers = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { following: user._id.toString() } },
        { new: true }
      );
      return { message: "User removed from following list" };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} name, username
   * @param {userId}, logged in user
   * @describe list of users following the user
   * @returns {Promise<{error: string}|{user: User}>}
    */
  async following(data) {
    try {
      const { name, userId } = data;
      const user = await User.findOne({ username: name });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const following = await User.find({ followers: userId });
      return { following };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} name, username
   * @param {userId}, logged in user
   * @describe list of users followers of the user
   * @returns {Promise<{error: string}|{user: User}>}
   */
  async followers(name) {
    try {
      console.log("name", name);
      const user = await User.findOne({ username: name });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      // list all users that have the user id in their following list
      const followers = await User.find({ following: user._id.toString() }).select("_id"); 
      // list all followers of the user
      const followings = user.following;
      console.log("followers", followers);
      console.log("followings", followings);
      return { followers,  followings };
    } catch (error) {
      return { error: error.message };
    }
  }
}
