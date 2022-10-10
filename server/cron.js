// all cron jobs are defined here
// cron jobs are run on the server

import { CronJob } from "cron";
import { User } from "./models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// connect to mongodb

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/auth",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
  }
);
// upload all data to mongodb
mongoose.connection.on("error", (err) => {
  console.log(err.message);
});

/**
 * @summary Cron job to run once a month
 * @locus Server (cron)
 * @name deleteDisabledUsers
 * @method deleteDisabledUsers
 * @returns {undefined}
 */

const deleteDisabledUsers = new CronJob("0 0 * * *", async () => {
  console.log("Deleting disabled users, running at: ", new Date()); //find all users that are disabled
  try {
    const users = await User.find({ isDisabled: true });
    //delete all users that are disabled
    users.forEach(async (user) => {
      console.log("Deleting user: ", user.username);
      await User.deleteOne({ _id: user._id });
    });
  } catch (err) {
    console.log(err);
  }
});

deleteDisabledUsers.start();

/**
 * @summary Cron job to run once a day
 * @locus Server (cron)
 * @name delete not verified users
 * @method deleteNotVerifiedUsers
 * @returns {undefined}
 **/
const deleteNotVerifiedUsers = new CronJob("0 0 * * *", async () => {
  console.log("Deleting not verified users, running at: ", new Date());
  //find all users that are not verified
  const users = await User.find({ isVerified: false });
  //delete all users that are not verified
  users.forEach(async (user) => {
    console.log("Deleting user: ", user.createdAt);
    //verify if created date is older than 24 hours
    const createdDate = new Date(user.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      await User.deleteOne({ _id: user._id });
    }
  });
});

deleteNotVerifiedUsers.start();
