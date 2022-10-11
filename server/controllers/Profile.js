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
   * @description Get user profile
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
}
