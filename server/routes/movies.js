import express from "express";
import mongoose from "mongoose";
import {User} from "../models/User.js";
import MovieController from "../controllers/Movie.js";
import Profile from "../controllers/Profile.js";
import dotenv from "dotenv";
dotenv.config({path: "../.env"});

const moviesRouter = express.Router();

moviesRouter.use('/', (req, res, next) => {
    if(req.originalUrl.includes('search')){
        next();
    } else {
        if(!req.session.user){
            return res.status(403).json({message: "Unauthorized", error : true  });
            return;
        }
        next();
    }
});

try {

    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/auth", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }, (err) => {
        if (err) throw err;
    }
    );
} catch (err) {
    console.log(err);
}

// upload all data to mongodb
mongoose.connection.on("error", (err) => {
    console.log(err.message);
});

// user can select a movie from the list of movies
// and add it to their favorites list


moviesRouter.post("/add-favorite", async (req, res) => {
    const {movieId} = req.body;
    if(!movieId){
        return res.status(400).json({error: "No data provided"});
    }
    const movieController = new MovieController();
    const result = await movieController.addToFavorites({movieId, userId: req.session.user});
    if(result.error) {
        return res.status(result.status).json({error: result.error});
    }
    return res.status(result.status).json({message: result.message});


});

// user can remove a movie from their favorites list
moviesRouter.post("/remove-favorite", async (req, res) => {
    const {movie, user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);
    const movies = userObj.favorites;
    const index = movies.indexOf(movie);
    movies.splice(index, 1);
    await User.updateOne({username: user.name}, {$set: {favorites: movies}});
    res.json({success: true});
});

// add to watchlist
moviesRouter.post("/add-watchlist", async (req, res) => {
    try {
        const {movieId} = req.body;
        const movieObj = new MovieController();
        const result = await movieObj.addToWatchlist({movieId, userId: req.session.user});
        if(result.error) {
            return res.status(result.status).json({error: result.error});
        }
        return res.status(result.status).json({message: result.message});

    } catch (err) {
        console.log(err);
    }

        


});

// remove from watchlist
moviesRouter.post("/remove-watchlist", async (req, res) => {
    const {movie, user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);
    const movies = userObj.watchlist;
    const index = movies.indexOf(movie);
    movies.splice(index, 1);
    await User.updateOne({username: user.name}, {$set: {watchlist: movies}});
    res.json({success: true});
});

// film completed
moviesRouter.post("/add-completed", async (req, res) => {
    const {movie, user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);
    const movies = userObj.completed;
    movies.push(movie);
    await User.updateOne({username: user.name}, {$set: {completed: movies}});
    res.json({success: true});
}
);

// film not completed
moviesRouter.post("/not-completed", async (req, res) => {
    const {movie, user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);
    const movies = userObj.completed;
    const index = movies.indexOf(movie);
    movies.splice(index, 1);
    await User.updateOne({username: user.name}, {$set: {completed: movies}});
    res.json({success: true});
}
);

moviesRouter.post('/add-watching', async (req, res) => {
    const {user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);
    const movies = userObj.watching;
    res.json({success: true, movies: movies});
}
);

// delete object from watching list
moviesRouter.post("/remove-watching", async (req, res) => {
    const {movie, user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);
    const movies = userObj.watching;
    const index = movies.indexOf(movie);
    movies.splice(index, 1);
    await User.updateOne({username: user.name}, {$set: {watching: movies}});
    res.json({success: true});
}
);

// get watching list
moviesRouter.post("/get-watching", async (req, res) => {
    const {user} = req.body;
    const profile = new Profile();
    const userObj = await profile.profile(user);

    // if types is tvMovies, then list only tv movies in watching list
    const movies = userObj.watching;
    if (!req.body.types) {
       return  res.json({success: true, movies: movies});
    } 
    const types = req.body.types;
    if (types === "tvMovies") {
        const tvMovies = movies.filter(movie => movie.types === types);
        return res.json({success: true, movies: tvMovies});
    } else if (types === "tvSeries") {
        const tvSeries = movies.filter(movie => movie.types === types);
        return res.json({success: true, movies: tvSeries});
    }
    return 0;
}
);

/**
 * @route POST /search
 * @desc search for a movie or tv series
 * @desc By default, sort by rating (desc) and limit to 10 results
 * @param {string} query
 * @returns {object} movie or tv series(title, imdbId, cover, type, raiting), or error
 * @todo add pagination, do not work very well at the moment
 */
moviesRouter.post("/search", async (req, res) => {
    const {search} = req.body;
    if(!search) {
        return res.status(400).json({error: "No data provided"});
    }
    const movieController = new MovieController();
    let nextResult = 0;
    let response = "";
    try {
        do {
            const result = await movieController.searchMovie(search, nextResult);
            if(result.error) {
                return res.status(result.status).json({error: result.error});
            }
            console.log(result);
            response = [...response, result];      
            nextResult = result.nextResult;
            if (result.nextResult === null) 
                break;
        }while(nextResult < 19); // first 20 results, with 10 results per page
        return res.status(200).json({response});

    } catch(e) {
        return res.status(500).json({error: e});
    }
});


export default moviesRouter;