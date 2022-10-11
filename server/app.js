import express from "express";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import morgan from "morgan";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config({ path: "../.env" });
const app = express();

// use route of Auth
import userRouter from "./routes/user.js";
import profile from "./routes/profile.js";
import movies from "./routes/movies.js";
import commentRouter from "./routes/comments.js";

// use middleware
app.use(express.json());
app.use(cookieParser());
// use morgan default options
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());

// use session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    session: {
      maxAge: 60 * 60 * 1000,
    },
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      collection: "sessions",
    }),
    // signed cookie
    signed: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// use route of Auth
app.use("/auth", userRouter);
app.use("/profile", profile);
app.use("/movies", movies);
app.use('/comments', commentRouter);

app.get("/", (req, res) => {
  if (req.session.user) {
    console.log(req.session.user);
    return res.send("You are logged in");
  }
  return res.status(401).json({ message: "You are not logged in" });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(
    `Server is running on port: ${process.env.PORT} at ${new Date()}`
  );
});
