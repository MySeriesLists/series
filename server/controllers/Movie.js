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

    async addToWatchlist(data) {
        console.log(data);
        try {

            if ( !data.movieId) {
                return { error: "No data provided", status: 400 };
            }

            const movieId = data.movieId;
            const user = await User.findOne({ _id : data.userId });
            if (!user) {
                return { error: "User not found", status: 404 };
            }
            const movie = await Movie.findOne({ imdbId: data.movieId });
            if (!movie) {
                return { error: "Movie not found", status: 404 };
            }
            const watchList = user.watchlist;
            if (watchList.includes(movieId)) {
                return { error: "Movie already in watchlist", status: 400 };
            }
            watchList.push(movieId);
            user.watchlist = watchList;
            await user.save();
            return { message: "Movie added to watch list", status: 200 };
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async searchMovie(data, nextResult) {
        try {
            if (!data) {
                return { error: "No data provided", status: 400 };
            }
            const regex = new RegExp(data, "img");// regex find movie containing search string
            const options = { sort: { rating: -1 }, limit : 11 }; // sort by gt to lt rating
            const projection = { title: 1, imdbId: 1, images :1, raiting: 1, _id: 0, type : 1 }; // only return title, imdbId, images, rating
            const movies = await Movie.find({ title: regex }, projection, options).skip(nextResult);

            //send a next page token to the client
            nextResult = movies.length > 10 ? (nextResult + 10) : null;
            
            return { movies: movies,  nextResult : nextResult, status: 200 };

            

        } catch (err) {
            console.log("an error occured while searching : ", err)
            return err;
        }
    }

}