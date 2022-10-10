import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import MovieController from "../controllers/Movie.js";
import Profile from "../controllers/Profile.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const moviesRouter = express.Router();

// controllers
const profile = new Profile();
const movieController = new MovieController();

moviesRouter.use("/", (req, res, next) => {
  if (req.originalUrl.includes("search")) {
    next();
  } else {
    if (!req.session.user) {
      return res.status(403).json({ message: "Unauthorized", error: true });
      return;
    }
    next();
  }
});

// user can select a movie from the list of movies
// and add it to their favorites list

moviesRouter.post("/add-favorite", async (req, res) => {
  try {
    const { imdbId } = req.body;
    if (!imdbId) {
      return res.status(400).json({ error: "No data provided" });
    }
    const result = await movieController.addToFavorites({
      imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    console.log(result);
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// user can remove a movie from their favorites list
moviesRouter.post("/remove-favorite", async (req, res) => {
  try {
    const { imdbId } = req.body;
    if (!imdbId) {
      return res.status(400).json({ error: "No data provided" });
    }
    const result = await movieController.removeFromFavorites({
      imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    console.log(result);
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// list of movies, series that the user has added to their favorites list
moviesRouter.get("/favorites", async (req, res) => {
  try {
    const result = await movieController.getFavoritesList({
      userId: req.session.user,
      nextResult: req.query.nextResult || null,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res
      .status(result.status)
      .json({ movies: result.movies, nextResult: result.nextResult });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// add to watchlist
moviesRouter.post("/add-watchlist", async (req, res) => {
  try {
    const { imdbId } = req.body;
    const result = await movieController.addToWatchlist({
      imdbId: imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

// remove from watchlist
moviesRouter.post("/remove-watchlist", async (req, res) => {
  try {
    const { imdbId } = req.body;
    if (!imdbId) {
      return res.status(400).json({ error: "No data provided" });
    }
    const result = await movieController.removeFromWatchlist({
      imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

moviesRouter.get("/watchlist", async (req, res) => {
  try {
    const result = await movieController.getWatchlist({
      userId: req.session.user,
      nextResult: req.query.nextResult || null,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res
      .status(result.status)
      .json({ movies: result.movies, nextResult: result.nextResult });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

// film completed
moviesRouter.post("/add-completed", async (req, res) => {
  try {
    const { imdbId } = req.body;
    const result = await movieController.addToCompletedList({
      imdbId: imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});
// remove from completed
moviesRouter.post("/remove-completed", async (req, res) => {
  try {
    const { imdbId } = req.body;
    if (!imdbId) {
      return res.status(400).json({ error: "No data provided" });
    }
    const result = await movieController.removeFromCompletedList({
      imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

moviesRouter.get("/completed", async (req, res) => {
  try {
    const result = await movieController.getCompletedList({
      userId: req.session.user,
      nextResult: req.query.nextResult || null,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res
      .status(result.status)
      .json({ movies: result.movies, nextResult: result.nextResult });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

moviesRouter.post("/add-watching", async (req, res) => {
  try {
    const { imdbId } = req.body;
    const result = await movieController.addToWatchingList({
      imdbId: imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

moviesRouter.post("/remove-watching", async (req, res) => {
  try {
    const { imdbId } = req.body;
    if (!imdbId) {
      return res.status(400).json({ error: "No data provided" });
    }
    const result = await movieController.removeFromWatchingList({
      imdbId,
      userId: req.session.user,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

moviesRouter.get("/watching", async (req, res) => {
  try {
    const result = await movieController.getWatchingList({
      userId: req.session.user,
      nextResult: req.query.nextResult || null,
    });
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res
      .status(result.status)
      .json({ movies: result.movies, nextResult: result.nextResult });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", err: err.message });
  }
});

/**
 * @route POST /search
 * @desc search for a movie or tv series
 * @desc By default, sort by rating (desc) and limit to 10 results
 * @param {string} query
 * @returns {object} movie or tv series(title, imdbId, cover, type, raiting), or error
 * @todo add pagination, do not work very well at the moment
 */
moviesRouter.post("/search", async (req, res) => {
  const { search } = req.body;
  if (!search) {
    return res.status(400).json({ error: "No data provided" });
  }
  const movieController = new MovieController();
  let nextResult = 0;
  let response = "";
  try {
    do {
      const result = await movieController.searchMovie(search, nextResult);
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      response = [...response, result];
      nextResult = result.nextResult;
      if (result.nextResult === null) break;
    } while (nextResult < 19); // first 20 results, with 10 results per page
    return res.status(200).json({ response });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});
export default moviesRouter;