import axios from "axios";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config({ path: "../.env" });
import nodeMailer from "nodemailer";
import { User } from "../models/User.js";

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
 *
 * @param {*} email
 * @param {*} code
 * @description send email to user to confirm their account
 * @returns <empty>
 */

async function sendEmail(route, email, code) {
  // send gmail with nodemailer
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Confirm your account",
    html: `<h1>Click on the link to confirm your account</h1>
        <a href="${process.env.BASE_URL}/auth/${route}?email=${email}&code=${code}>Confirm</a>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

export default class Auth {
  /**
   * Represents a user.
   * @constructor
   */
  constructor() {
    this.auth = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/auth",
      withCredentials: true,
    });
  }

  /**
   *
   * @param {*} data
   * @description get user email, name, id to create new user
   * @returns
   */

  async signup(data) {
    try {
      const user = new User(data);
      const image = await user.generateAvatar(data.username);
      user.image = image;
      await user.save();
      const route = "confirm";
      // send email
      sendEmail(route, user.email, user.code);
      return { user: user._id };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   *
   * @param {string} data
   * @description create new refresh token
   * @description delete old refresh token
   * @description create an access token
   * @returns <success> or <error>
   */

  async login(data) {
    try {
      const credential = data.credential.toLowerCase();
      const user = await User.findByCredentials(
        credential,
        data.password,
        data.isEmail
      );
      const _id = user._id;
      if (!_id) {
        return { status: "error", error: "Invalid login credentials" };
      }
      if (!user.isVerified) {
        return { status: "error", error: "Please confirm your account" };
      }
      if (user.isDisabled) {
        return { status: "error", error: "Your account is disabled" };
      }

      return { user: user._id };
    } catch (error) {
      console.log(error);
      return { status: "error" };
    }
  }

  /**
   *
   * @param {*} data
   * @description redirect to connected user
   * @returns user
   */

  async me(data) {
    // decode token
    const token = data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    return user;
  }

  /**
   *
   * @param {*} data
   * @description enable user account
   * @returns <success> or <error>
   */

  async enableAccount(data) {
    const user = await user.findOne({ _id: data._id });
    if (!user) {
      return { status: "error", error: "User not found" };
    }
    user.isDisabled = false;
    await user.save();
    return user;
  }

  /**
   * @description forget password, send email to user
   * @param {*} data
   * @returns <success> or <error>
   */

  /**
   *
   * @param {*} data activate user account
   * @returns
   */

  async resetPassword(data) {
    const user = await User.findOne({ email: data });
    if (!user) {
      return { status: "error", error: "User not found" };
    }
    //create one time password
    const code =
      Math.random().toString(36).substring(5, 15) +
      Math.random().toString(36).substring(2, 15);
    //create a jwt token
    const token = jwt.sign({ code }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.code = code;
    await user.save();
    const route = "change-password";
    // send email
    sendEmail(route, user.email, token);
    return { status: "success" };
  }

  /**
   *
   * @param email user email
   * @param code one time token code
   * @description change user password, if token is valid
   * @returns <success>
   */
  async changePassword(data) {
    console.log(data);
    if (!data.code || !data.email) {
      return { status: "error", error: "Invalid data" };
    }
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return { status: "error", error: "User not found" };
    }
    // verify token
    const decoded = jwt.verify(data.code, process.env.JWT_SECRET);
    if (decoded.code !== user.code) {
      return { status: "error", error: "Invalid token" };
    }
    // crypt password
    const hash = await bcrypt.hash(decoded.code, 10);
    user.password = hash;
    user.code = null;
    await user.save();
    return {
      status: "success",
      message: "Password changed",
      password: decoded.code,
    };
  }

  async confirm(data) {
    const code = data.code;
    const email = data.email;
    console.log(code);
    console.log(email);

    const user = await User.findOne({ email: email });
    if (!user) {
      return { status: "error", error: "Invalid email" };
    }
    if (user.isVerified)
      return {
        status: "success",
        message: "Your account has been verified. Please log in.",
      };
    if (user) {
      if (user.code === code) {
        // update isVerified to true
        user.isVerified = true;
        // remove code
        user.code = undefined;
        await user.save();
        return { status: "success" };
      } else {
        console.log("code is not correct", code);
        return { status: "error" };
      }
    } else {
      return { status: "error" };
    }
  }

  /**
   * @description disable user account by setting isDisabled to true
   * @description a disabled user cannot login
   * @description a disabled account will be deleted after 30 days
   * @description remove all tokens
   *
   * @param {authToken} data  - authToken
   * @returns delete user from database
   */

  async disableAccount(data) {
    const user = await User.findOne({ _id: data._id });
    if (!user) {
      return { status: "error", error: "Invalid user" };
    }
    user.isDisabled = true;
    user.tokens = [];
    await user.save();
    return { status: "success" };
  }

  /**
   * @description generate google auth url
   */
  async getGoogleAuthURL() {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=${process.env.GOOGLE_SCOPE}`;
    return url;
  }

  /**
   * @description get google access token
   * @param {string} code - google auth code
   * @returns google access token
   * @description get google user profile
   * @param {string} accessToken - google access token
   * @returns google user profile
   * @description create new user if user does not exist
   * @description create new access token
   * @description create new refresh token
   * @returns user, access token, refresh token
   **/

  async googleAuth(data) {
    try {
      const code = data;
      const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&grant_type=authorization_code`;
      const result = await axios.post(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const accessToken = result.data.access_token;
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const email = userInfo.data.email;
      const user = await User.findOne({ email: email });
      if (user) {
        // return only user id
        return { user: user._id };
      } else {
        //  verify userName is unique
        let userName = userInfo.data.given_name;
        const user = await User.findOne({ username: userName });
        if (user) {
          userName = userName + Math.floor(Math.random() * 1000000);
        }

        const randomPassword =
          Math.random().toString(36).slice(-8) +
          Math.floor(Math.random() * 1000000);
        const newUser = new User({
          username: userName,
          email: userInfo.data.email,
          password: randomPassword,
          image: userInfo.data.picture,
        });

        // delete isVerified
        newUser.isVerified = true;
        await newUser.save();

        return { user: newUser._id };
      }
    } catch (error) {
      console.log(error);
    }
  }
}
