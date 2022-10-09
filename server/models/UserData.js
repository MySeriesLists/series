
import mongoose from "mongoose";
const Schema = mongoose.Schema;
export default mongoose.model("UserData", new Schema({

    user_id: {
        type: String,
        required: true,
        unique: true,
    },
    movies: {
        type: String,
        required: false,
        watchlist: [],
        watched: [],
    },
    tvSeries: {
        type: Array,
        required: false,
        watchlist: [],
        watched: [],
        nbEpisodes: Number,
    },
},
));
