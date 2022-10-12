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

/**
 * @middleware check if user is logged in except for search
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {string} next()
 * @access logged in user
 */

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

/**
 * @route -get /:name
 * @param {string} name
 * @description Get movie info
 * @returns {Promise<{error: string}|{user: User}>}
 */

moviesRouter.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    if(!_id) return res.status(400).send({error: "Invalid movie name"})
    const response = await movieController.movieInfo({ _id });
    if (response.error) {
      return res.status(400).send(response);
    }
    return res.status(200).send(response);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});



/**
 * @route       - post /add-favorite
 * @description    - add movie to favorites,
 * @description    - user can select a movie from the list of movies
 * @description    - and add it to their favorites list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie added to favorites"}
 * @responseType - {string, string}
 * @response     - {status: "error", message: "Movie already in favorites"}
 * @responseType - {string, string}
 * @response     - {status: "error", message: "Movie not found"}
 */

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

/**
 * @route       - post /remove-favorite
 * @description    - remove movie from favorites,
 * @description    - user can select a movie from the list of movies
 * @description    - and remove it from their favorites list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie removed from favorites"}
 * @responseType - {string, string}
 * @response     - {status: "error", message: "Movie not in favorites"}
 
 */

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

/**
 * @route       - get /favorites
 * @description    - get user's favorites
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @response    - {status: "success", message: "Movies found", movies: []}
 * @responseType - {string, string, array} 
 */

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

/**
 * @route       - post /add-watchlist
 * @description    - add movie to watchlist,
 * @description    - user can select a movie from the list of movies
 * @description    - and add it to their watchlist
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie added to watchlist"}
 * @responseType - {string, string}
 */

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

/**
 * @route       - post /remove-watchlist
 * @description    - remove movie from watchlist,
 * @description    - user can select a movie from the list of movies
 * @description    - and remove it from their watchlist
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie removed from watchlist"}
 * @responseType - {string, string}
 */

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

/**
 * @route       - get /watchlist
 * @description    - get user's watchlist
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @response    - {status: "success", message: "Movies found", movies: []}
 * @responseType - {string, string, array}
 */

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

/**
 * @route       - post /add-completed
 * @description    - add movie to completed list,
 * @description    - user can select a movie from the list of movies
 * @description    - and add it to their completed list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie added to completed list"}
 */

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

/**
 * @route       - post /remove-completed
 * @description    - remove movie from completed list,
 * @description    - user can select a movie from the list of movies
 * @description    - and remove it from their completed list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie removed from completed list"}
 */
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

/**
 * @route       - get /completed
 * @description    - get user's completed list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @response    - {status: "success", message: "Movies found", movies: []}
 * @responseType - {string, string, array}
 */

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

/**
 * @route       - post /add-watching
 * @description    - add movie to watching list,
 * @description    - user can select a movie from the list of movies
 * @description    - and add it to their watching list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie added to watching list"}
 * @responseType - {string, string}
 */

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

/** 
 * @route       - post /remove-watching
 * @description    - remove movie from watching list,
 * @description    - user can select a movie from the list of movies
 * @description    - and remove it from their watching list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId
 * @bodyType    - string
 * @bodyExample - "tt0111161"
 * @response    - {status: "success", message: "Movie removed from watching list"}
 * @responseType - {string, string}
 */

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

/**
 * @route       - get /watching
 * @description    - get user's watching list
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @response    - {status: "success", message: "Movies found", movies: []}
 * @responseType - {string, string, array}
 */

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
 * @route       - post /add-progress
 * @description    - add series to progress list, (series only)
 * @description    - user can select a series from the list of series and update episode number and season number
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - imdbId, season, episode
 * @bodyType    - string, number, number
 * @bodyExample - "tt0111161", 1, 1
 * @response    - {status: "success", message: "Series added to progress list"}
 * @responseType - {string, string}
 */

moviesRouter.post("/add-progress", async (req, res) => {
  try {
    const { imdbId, episode, season } = req.body;
    const result = await movieController.addProgress({
      imdbId,
      userId: req.session.user,
      episode,
      season,
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
