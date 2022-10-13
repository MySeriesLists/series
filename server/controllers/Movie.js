import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import Movie from "../models/Movie.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import axios from "axios";

export default class MovieController {
  constructor() {
    this.auth = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/auth",
      withCredentials: true,
    });
  }

  /**
   * @param {String} imdbId
   * @description show movie details
   * @returns {Object} movie
   */

  async movieInfo(data) {
    try {
      const movie = await Movie.findOne({ imdbId: data._id });
      if (!movie) {
        return { error: "Movie not found", status: 404 };
      }
      return { movie };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} imdbId
   * @param {mongoId} userId
   * @description checks if a movie is in the user's watchlist, if not, adds it
   * @returns {message, status}
   */

  async addToWatchlist(data) {
    console.log(data);
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }

      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const movie = await Movie.findOne({ imdbId: data.imdbId });
      if (!movie) {
        return { error: "Movie not found", status: 404 };
      }

      const watchList = user.watchList;
      const movieExists = watchList.find((movie) => movie.imdbId === imdbId);
      if (movieExists) {
        return { error: "Movie already in watchlist", status: 400 };
      }
      // add the movie to the watchlist
      watchList.push({
        imdbId: movie.imdbId,
        dateAdded: new Date(),
      });

      // remove the movie from watchings, or completed
      const watchings = user.watching;
      const movieExistsWatching = watchings.find(
        (movie) => movie.imdbId === imdbId
      );
      if (movieExistsWatching) {
        const index = watchings.indexOf(movieExistsWatching);
        watchings.splice(index, 1);
      }
      const completed = user.completed;
      const movieExistsCompleted = completed.find(
        (movie) => movie.imdbId === imdbId
      );
      if (movieExistsCompleted) {
        const index = completed.indexOf(movieExistsCompleted);
        completed.splice(index, 1);
      }

      // save the user
      await user.save();
      return { message: "Movie added to watchlist", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   *
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be added to the watchlist
   * @description removes a movie,series from the watchlist
   * @returns {message, status}
   */

  async removeFromWatchlist(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const watchList = user.watchList;
      const movieExists = watchList.find((movie) => movie.imdbId === imdbId);
      if (!movieExists) {
        return { error: "Movie removed from watchlist", status: 400 };
      }
      // remove the movie from the watchlist
      const index = watchList.indexOf(movieExists);
      watchList.splice(index, 1);
      // save the user
      await user.save();
      return { message: "Movie removed from watchlist", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  /**
   *
   * @param {mongoId} data  user id
   * @param {int} nextResult pagination token (optional)
   * @description gets the user's watchlist and returns the movies imdId orderBy added date, limit 20
   * @returns {movies, nextResult, sratus} list of movies or series watched by the user
   */

  async getWatchlist(data, nextResult) {
    try {
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (!user.watchList.length) {
        return { error: "Watchlist is empty", status: 404 };
      }
      if (!nextResult) {
        nextResult = 0;
      }
      let limit =
        nextResult + 20 > user.watchList.length
          ? user.watchList.length
          : nextResult + 20;

      const watchList = user.watchList;
      const movies = [];
      for (nextResult; nextResult < limit; nextResult++) {
        const movie = await Movie.findOne({
          imdbId: watchList[nextResult].imdbId,
        });
        // only return title, imdbId, images, rating
        const projection = {
          title: movie.title,
          imdbId: movie.imdbId,
          images: movie.images,
          type: movie.type,
          description: movie.description,
        };
        movies.push(projection);
      }
      nextResult = nextResult + 20 > user.watchList.length ? null : nextResult;
      return { movies: movies, nextResult: nextResult, status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be added to the favorite list
   * @description adds a movie,series to the completed list
   * @returns {message, status}
   */
  async addToFavorites(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }

      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const movie = await Movie.findOne({ imdbId: data.imdbId });
      if (!movie) {
        return { error: "Movie not found", status: 404 };
      }

      const favorites = user.favorites;
      const movieExists = favorites.find((movie) => movie.imdbId === imdbId);
      if (movieExists) {
        return { error: "Movie already in favorites", status: 400 };
      }
      // add the movie to the favorites
      favorites.push({
        imdbId: movie.imdbId,
        dateAdded: new Date(),
      });
      // save the user
      await user.save();
      return { message: "Movie added to favorites", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  catch(error) {
    console.log(error);
    return error;
  }
  /**
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be removed to the favorite list
   * @description removes a movie,series from the favorite list
   * @returns {message, status}
   */
  async removeFromFavorites(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const favorites = user.favorites;
      const movieExists = favorites.find((movie) => movie.imdbId === imdbId);
      if (!movieExists) {
        return { error: "Movie removed from favorites", status: 400 };
      }
      // remove the movie from the favorites
      const index = favorites.indexOf(movieExists);
      favorites.splice(index, 1);
      // save the user
      await user.save();
      return { message: "Movie removed from favorites", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @nextResult pagination token  (optional)
   * @description gets the user's favorite list and returns the movies imdId orderBy added date, limit 20
   * @returns {movies, nextResult, sratus} list of movies or series watched by the user
   */
  async getFavoritesList(data, nextResult) {
    try {
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (!user.favorites.length) {
        return { error: "Favorites list is empty", status: 404 };
      }
      if (!nextResult) {
        nextResult = 0;
      }
      let limit =
        nextResult + 20 > user.favorites.length
          ? user.favorites.length
          : nextResult + 20;

      const favorites = user.favorites;
      const movies = [];
      for (nextResult; nextResult < limit; nextResult++) {
        const movie = await Movie.findOne({
          imdbId: favorites[nextResult].imdbId,
        });
        // only return title, imdbId, images, rating
        const projection = {
          title: movie.title,
          imdbId: movie.imdbId,
          images: movie.images,
          type: movie.type,
          description: movie.description,
        };
        movies.push(projection);
      }
      nextResult = nextResult + 20 > user.favorites.length ? null : nextResult;
      return { movies: movies, nextResult: nextResult, status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be added to the completed list
   * @description adds a movie,series to the completed list
   * @returns {message, status}
   */
  async addToCompletedList(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const movie = await Movie.findOne({ imdbId: data.imdbId });
      if (!movie) {
        return { error: "Movie not found", status: 404 };
      }
      const completed = user.completed;
      const movieExists = completed.find((movie) => movie.imdbId === imdbId);
      if (movieExists) {
        return { error: "Movie already in completed", status: 400 };
      }
      // add the movie to the completed
      completed.push({
        imdbId: movie.imdbId,
        dateAdded: new Date(),
      });

      // remove the movie from the watchlist, or from watching
      const watchList = user.watchList;
      const movieExistsInWatchlist = watchList.find(
        (movie) => movie.imdbId === imdbId
      );
      if (movieExistsInWatchlist) {
        const index = watchList.indexOf(movieExistsInWatchlist);
        watchList.splice(index, 1);
      }
      const watching = user.watching;
      const movieExistsInWatching = watching.find(
        (movie) => movie.imdbId === imdbId
      );
      if (movieExistsInWatching) {
        const index = watching.indexOf(movieExistsInWatching);
        watching.splice(index, 1);
      }

      // save the user
      await user.save();
      return { message: "Movie added to completed", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  /**
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be removed to the completed list
   * @description removes a movie,series from the completed list
   * @returns {message, status}
   */
  async removeFromCompletedList(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const completed = user.completed;
      const movieExists = completed.find((movie) => movie.imdbId === imdbId);
      if (!movieExists) {
        return { error: "Movie removed from completed", status: 400 };
      }
      // remove the movie from the completed
      const index = completed.indexOf(movieExists);
      completed.splice(index, 1);
      // save the user
      await user.save();
      return { message: "Movie removed from completed", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @nextResult pagination token  (optional)
   * @description gets the user's completed list and returns the movies imdId orderBy added date, limit 20
   * @returns {movies, nextResult, sratus} list of movies or series watched by the user
   */
  async getCompletedList(data, nextResult) {
    try {
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (!user.completed.length) {
        return { error: "Completed list is empty", status: 404 };
      }
      if (!nextResult) {
        nextResult = 0;
      }
      let limit =
        nextResult + 20 > user.completed.length
          ? user.completed.length
          : nextResult + 20;
      const completed = user.completed;
      const movies = [];
      for (nextResult; nextResult < limit; nextResult++) {
        const movie = await Movie.findOne({
          imdbId: completed[nextResult].imdbId,
        });
        // only return title, imdbId, images, rating
        const projection = {
          title: movie.title,
          imdbId: movie.imdbId,
          images: movie.images,
          type: movie.type,
          description: movie.description,
        };
        movies.push(projection);
      }
      nextResult = nextResult + 20 > user.completed.length ? null : nextResult;
      return { movies: movies, nextResult: nextResult, status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be added to the watching list
   * @description adds a movie,series to the watchlist
   * @returns {message, status}
   */
  async addToWatchingList(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const movie = await Movie.findOne({ imdbId: data.imdbId });
      if (!movie) {
        return { error: "Movie not found", status: 404 };
      }
      const watching = user.watching;
      const movieExists = watching.find((movie) => movie.imdbId === imdbId);
      if (movieExists) {
        return { error: "Movie already in watching", status: 400 };
      }
      // add the movie to the watching
      watching.push({
        imdbId: movie.imdbId,
        dateAdded: new Date(),
      });

      // remove the movie from the watchlist, or from completed
      const watchList = user.watchList;
      const movieExistsInWatchlist = watchList.find(
        (movie) => movie.imdbId === imdbId
      );
      if (movieExistsInWatchlist) {
        const index = watchList.indexOf(movieExistsInWatchlist);
        watchList.splice(index, 1);
      }
      const completed = user.completed;
      const movieExistsInCompleted = completed.find(
        (movie) => movie.imdbId === imdbId
      );
      if (movieExistsInCompleted) {
        const index = completed.indexOf(movieExistsInCompleted);
        completed.splice(index, 1);
      }

      // save the user
      await user.save();
      return { message: "Movie added to watching", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  /**
   * @param {mongoId} data, userId
   * @param {imdbId}
   * @description id of the movie (type :tvSeries), add progress to the watching list (with the episode number and season number)
   * @returns {message, status}
   */
  async addProgress(data) {
    try {
      if (!data.imdbId || !data.episode || !data.season) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const movie = await Movie.findOne({ imdbId: data.imdbId });
      if (!movie) {
        return { error: "Movie not found", status: 404 };
      }
      if (movie.type !== "tvSeries") {
        return { error: "Movie is not a tvSeries", status: 400 };
      }
      const watching = user.watching;
      const movieExists = watching.find((movie) => movie.imdbId === imdbId);
      if (movieExists) {
        // update the progress
        if(episodes.length <= data.episode || seasons.length <= data.season){
          movieExists.progress = {
            episode: data.episode,
            season: data.season,
          };
        }else{
          return { error: "Invalid episode or season number", status: 400 };
        }
      }
      return { message: "Movie progress updated", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @param {imdbId} id of the movie, series to be removed to the watching list
   * @description removes a movie,series from the watching list
   * @returns {message, status}
   */
  async removeFromWatchingList(data) {
    try {
      if (!data.imdbId) {
        return { error: "No data provided", status: 400 };
      }
      const imdbId = data.imdbId;
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const watching = user.watching;
      const movieExists = watching.find((movie) => movie.imdbId === imdbId);
      if (!movieExists) {
        return { error: "Movie removed from watching", status: 400 };
      }
      // remove the movie from the watching
      const index = watching.indexOf(movieExists);
      watching.splice(index, 1);
      // save the user
      await user.save();
      return { message: "Movie removed from watching", status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * @param {mongoId} data, userId
   * @nextResult pagination token  (optional)
   * @description gets the user's watching list and returns the movies imdId orderBy added date, limit 20
   * @returns {movies, nextResult, sratus} list of movies or series watched by the user
   */
  async getWatchingList(data, nextResult) {
    try {
      const user = await User.findOne({ _id: data.userId });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (!user.watching.length) {
        return { error: "Watching list is empty", status: 404 };
      }
      if (!nextResult) {
        nextResult = 0;
      }
      let limit =
        nextResult + 20 > user.watching.length
          ? user.watching.length
          : nextResult + 20;
      const watching = user.watching;
      const movies = [];
      for (nextResult; nextResult < limit; nextResult++) {
        const movie = await Movie.findOne({
          imdbId: watching[nextResult].imdbId,
        });
        // only return title, imdbId, images, rating
        const projection = {
          title: movie.title,
          imdbId: movie.imdbId,
          images: movie.images,
          type: movie.type,
          description: movie.description,
        };
        movies.push(projection);
      }
      nextResult = nextResult + 20 > user.watching.length ? null : nextResult;
      return { movies: movies, nextResult: nextResult, status: 200 };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   *
   * @param {String} data, contains user input in title,
   * @param {*} nextResult (pagination token)
   * @description searches for movies, series in the database, ordered by rating, limit 20 with nextPageToken system.
   * @returns {movies, nextResult, status}
   */

  async searchMovie(data, nextResult) {
    try {
      if (!data) {
        return { error: "No data provided", status: 400 };
      }
      const regex = new RegExp(data, "img"); // regex find movie containing search string
      const options = { sort: { rating: -1 }, limit: 11 }; // sort by gt to lt rating
      const projection = {
        title: 1,
        imdbId: 1,
        images: 1,
        raiting: 1,
        description: 1,
        _id: 0,
        type: 1,
      }; // only return title, imdbId, images, rating
      const movies = await Movie.find(
        { title: regex },
        projection,
        options
      ).skip(nextResult);

      //send a next page token to the client
      nextResult = movies.length > 10 ? nextResult + 10 : null;

      return { movies: movies, nextResult: nextResult, status: 200 };
    } catch (err) {
      console.log("an error occured while searching : ", err);
      return err;
    }
  }
}
