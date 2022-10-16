import axios from "axios";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config({ path: "../.env" });
import nodeMailer from "nodemailer";
import { User } from "../models/User.js";
import { connectToDB } from "../utils/generateToken.js";

connectToDB();
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
      return { status: "error", error: error.message };
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
      return { status: "error", error: error.message };
    }
  }

  /**
   *
   * @param {*} data
   * @description enable user account
   * @returns <success> or <error>
   */

  async enableAccount(data) {
    try {
      const user = await user.findOne({ _id: data._id });
      if (!user) {
        return { status: "error", error: "User not found" };
      }
      user.isDisabled = false;
      await user.save();
      return user;
    } catch (error) {
      console.log(error);
      return { status: "error", error: error.message };
    }
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
    try {
      const user = await User.findOne({ email: data });
      if (!user) {
        return { status: "error", error: "User not found" };
      }
      //create one time password
      const code =
        Math.random().toString(36).substring(5, 15) +
        Math.random().toString(36).substring(2, 15);

      user.code = code;
      await user.save();
      const route = "change-password";
      // send email
      sendEmail(route, user.email, user.code);
      return { status: "success", message: "Email sent" };
    } catch (error) {
      return { status: "error", error: error.message };
    }
  }

  /**
   *
   * @param email user email
   * @param code one time token code
   * @description change user password, if token is valid
   * @returns <success>
   */
  async changePassword(data) {
    try {
      if (!data.code || !data.email) {
        return { status: "error", error: "Invalid data" };
      }
      const user = await User.findOne({ email: data.email });
      if (!user) {
        return { status: "error", error: "User not found" };
      }
      if (user.code !== data.code) {
        return { status: "error", error: "Invalid code" };
      }

      // generate new password
      const password = Math.random().toString(36).substring(8, 15) + Math.random() * 100000;

      user.password = password;


      user.code = null;
      await user.save();
      return {
        status: "success",
        message: "Password changed, for security reasons, please change password",
        password: password,
      };
    } catch (error) {
      console.log(error);
      return { status: "error", error: error.message };
    }
  }

  async confirm(data) {
    try {
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
          return { status: "error", error: "Invalid code" };
        }
      } else {
        return { status: "error", error: "Invalid email" };
      }
    } catch (error) {
      console.log(error);
      return { status: "error", error: error.message };
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
    try {
      const user = await User.findOne({ _id: data._id });
      if (!user) {
        return { status: "error", error: "Invalid user" };
      }
      user.isDisabled = true;
      user.tokens = [];
      await user.save();
      return { status: "success", message: "Account disabled" };
    } catch (error) {
      console.log(error);
      return { status: "error", error: error.message };
    }
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

        return {
          user: newUser._id,
          status: "success",
          message: "User created",
        };
      }
    } catch (error) {
      console.log(error);
      return { status: "error", error: error.message };
    }
  }
}
