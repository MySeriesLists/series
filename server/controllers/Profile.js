import axios from "axios";
import { User } from "../models/User.js";
import dotenv from "dotenv";
import passwordStrength from "check-password-strength";
dotenv.config({ path: "../.env" });

export default class Profile {
  constructor() {
    this.auth = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/auth",
      withCredentials: true,
    });
  }

  /**
   * @param {string} name
   * @returns {Promise<{error: string}|{user: User}>}
   * @memberof Profile
   * @description Get user profile
   * @example
   * const userProfile = new Profile();
   * userProfile.profile({ name: "John" })
   * .then((response) => {
   *    console.log("response", response);
   *   if (response.error) {
   *    res.status(400).send(response.error);
   *  }
   * res.status(200).send(response);
   */
  async profile(data) {
    try {
      // verify username is current user logged in
      const { name, user_id } = data;
      console.log("name", name);
      console.log("user_id", user_id);

      let user = await User.findOne({ username: name });

      let response = {};
      if (!user) {
        return { error: "User not found", status: 404 };
      }

      // check if account is private, if private don't show profile except for user and friends
      if (user.isPrivate) {
        // check if user is logged in
        if (!user_id) {
          return { error: "User is private", status: 401 };
        }

        // only friends can see profile
        if (user_id !== user._id.toString()) {
          // check if user is friend
          let isFriend = user.friends.find(
            (friend) => friend.toString() === user_id
          );

          if (!isFriend) {
            return { error: "User is private", status: 401 };
          }
        }
      }
      // random visitors
      if (user_id !== user._id.toString()) {
        response = await User.findOne({ username: name }).select(
          "-password -__v -sendFriendRequests -pendingFriendRequests"
        );
        response.friends = user.friends.length; //replace friends with number of friends
      } else {
        // user logged in
        response = await User.findOne({ username: name }).select("-password");
        response.friends = user.friends.length;
      }

      // return user  without password
      return {
        user: response,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {string} code, category (watching, completed, favorites, watchList)
   * @param {string} name, username
   * @next {int} next, next page
   * @description get list of movies, depending on the code
   * if code === "favorites" return favorites
   * if code === "completed" return completed
   * if code === "watching" return watching
   * if code === "watchList" return watchList
   * @returns {Promise<{error: string}|{movies: Array}>}
   *
   */
  async moviesList(data) {
    try {
      let { code, name, next } = data;
      console.log("code", code);
      console.log("name", name);
      !code ? (code = "watching") : (code = code);
      !next ? (next = 0) : (next = next);
      console.log("code", code);
      const user = await User.findOne({ username: name });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const lists = await User.find({ username: data.name })
        .select(code)
        .limit(10)
        .skip(next);
      let movies = [];

      lists.forEach((list) => {
        list[code].forEach((movie) => {
          movies.push(movie.imdbId);
        });
      });

      return { movies };
    } catch (error) {
      return { error: error.message };
    }
  }

  // add friends
  async addFriend(data) {
    try {
      const { user_id, friendName } = data;
      const user = await User.findOne({ _id: user_id });
      const friend = await User.findOne({ username: friendName });
      console.log("user", user);
      console.log("friend", friend);

      if (!user || !friend || user_id === friend._id.toString()) {
        return { error: "Invalid username", status: 400 };
      }

      // check if user is already a friend
      const isFriend = user.friends.find(
        (friend) => friend.toString() === friend._id.toString()
      );
      // check if user has sent a friend request
      const isRequested = user.sendFriendRequests.find(
        (friend) => friend.toString() === friend._id.toString()
      );

      if (isFriend || isRequested) {
        return { error: "Can not send friend request", status: 400 };
      }

      // add pendingFriendRequest to friend
      await User.findOneAndUpdate(
        { _id: friend._id },
        { $push: { pendingFriendRequests: user._id } },
        { new: true }
      );

      // add sentFriendRequest to user
      await User.findOneAndUpdate(
        { _id: user._id },
        { $push: { sendFriendRequests: friend._id } },
        { new: true }
      );

      // send notification to friend
      /*
      await this.auth.post("/notification", {
        user_id: friend._id,
        message: `${user.username} sent you a friend request`,
        type: "friendRequest",
        link: `/profile/${user.username}`,
      });*/

      return { message: "Friend request send successfully", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // remove friends
  async removeFriend(data) {
    try {
      const { user_id, friendName } = data;
      const user = await User.findOne({ _id: user_id });
      const friend = await User.findOne({ username: friendName });
      if (!user || !friend) {
        return { error: "Invalid username ", status: 400 };
      }

      // remove friend from user and friend
      await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { friends: friend._id } },
        { new: true }
      );

      await User.findOneAndUpdate(
        { _id: friend._id },
        { $pull: { friends: user._id } },
        { new: true }
      );

      return { message: "Friend removed successfully", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  async getFriendRequests(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      return { friendRequests: user.pendingFriendRequests };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  async acceptFriendRequest(data) {
    try {
      const { user_id, friendName } = data;
      const user = await User.findOne({ _id: user_id });
      const friend = await User.findOne({ username: friendName });
      if (!user || !friend) {
        return { error: "Invalid username ", status: 400 };
      }

      // verify if user has a pending friend request
      const isRequested = user.pendingFriendRequests.find(
        (friend) => friend.toString() === friend._id.toString()
      );
      // verify if user is already a friend
      const isFriend = user.friends.find(
        (friend) => friend.toString() === friend._id.toString()
      );

      if (!isRequested || isFriend || user_id === friend._id.toString()) {
        return { error: "Invalid friend request", status: 400 };
      }

      // update friends array for both user and friend and push to friends array
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $push: { friends: friend._id },
          $pull: { pendingFriendRequests: friend._id },
        }
      );

      await User.findOneAndUpdate(
        { _id: friend._id },
        {
          $push: { friends: user._id },
          $pull: { sendFriendRequests: user._id },
        },
        { new: true }
      );

      return { message: "Friend request accepted", status: "success" };
    } catch (error) {
      return { error: error.message };
    }
  }

  async rejectFriendRequest(data) {
    try {
      const { user_id, friendName } = data;
      const user = await User.findOne({ _id: user_id });
      const friend = await User.findOne({ username: friendName });
      if (!user || !friend) {
        return { error: "Invalid username ", status: 400 };
      }

      // remove friend from user and friend
      await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { pendingFriendRequests: friend._id } },
        { new: true }
      );

      await User.findOneAndUpdate(
        { _id: friend._id },
        { $pull: { sendFriendRequests: user._id } },
        { new: true }
      );

      return { message: "Friend request rejected", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  async getFriends(data) {
    try {
      const { name } = data;
      const user = await User.findOne({ username: name });
      if (!user) {
        return { error: "User not found", status: 404 };
      }

      // return friends with id and populate username and profile picture
      const friends = await User.find({
        _id: { $in: user.friends },
      }).select("username image");

      return { friends };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // user settings parameters
  async updateUserName(data) {
    //update user name
    try {
      const { user_id, name } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      // verify if username is already taken
      const isTaken = await User.findOne({ username: name });
      if (isTaken) {
        return { error: "Username is already taken", status: 400 };
      }
      //verfiy if username is valid
      const isValid = name.match(/^[a-zA-Z0-9]+$/);
      if (!isValid || name.length < 3) {
        return { error: "Username is invalid", status: 400 };
      }
      await User.findOneAndUpdate({ _id: user_id }, { name }, { new: true });
      return { message: "Name updated successfully", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // change user password
  async changePassword(data) {
    try {
      const { user_id, oldPassword, newPassword } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      // verify if old password is correct
      const isCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isCorrect) {
        return { error: "Old password is incorrect", status: 400 };
      }
      // verify if new password is valid
      if (newPassword.passwordStrength < 2) {
        return { error: "Please chose a stronger password...", status: 400 };
      }
      // hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findOneAndUpdate(
        { _id: user_id },
        { password: hashedPassword },
        { new: true }
      );
      return { message: "Password updated successfully", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // make account private
  async makePrivate(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { isPrivate: true },
        { new: true }
      );
      return { message: "Account is now private", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // make account public
  async makePublic(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { isPrivate: false },
        { new: true }
      );
      return { message: "Account is now public", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  //disable account
  async disableAccount(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { isDisabled: true },
        { new: true }
      );
      return { message: "Account is now disabled", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  //enable account
  async enableAccount(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { isDisabled: false },
        { new: true }
      );
      return { message: "Account is now enabled", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // give admin rights
  async giveAdminRights(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { isAdmin: true },
        { new: true }
      );
      return { message: "Admin rights given", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // remove admin rights
  async removeAdminRights(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { isAdmin: false },
        { new: true }
      );
      return { message: "Admin rights removed", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // add awards to awards array
  async addAwards(data) {
    try {
      const { user_id, awards } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { $push: { awards } },
        { new: true }
      );
      return { message: "Awards added", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // last active
  async lastActive(data) {
    try {
      const { user_id } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      await User.findOneAndUpdate(
        { _id: user_id },
        { lastActive: Date.now() },
        { new: true }
      );
      return { message: "Last active updated", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // update bio
  async updateBio(data) {
    try {
      const { user_id, bio } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      if (bio.length >= 0 && bio.length <= 250) {
        await User.findOneAndUpdate({ _id: user_id }, { bio }, { new: true });
        return { message: "Bio updated", status: "success" };
      } else {
        return {
          error: "Bio must be between 0 and 250 characters",
          status: 400,
        };
      }
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // add personal website
  async addPersonalWebsite(data) {
    try {
      const { user_id, personalWebsite } = data;
      console.log(personalWebsite);

      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }

      await User.findOneAndUpdate(
        { _id: user_id },
        { personalWebsite },
      );
      return { message: "Personal website added", status: "success" };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  // add social media
  async addSocialMediaLink(data) {
    try {
      const { user_id, link, mediaTypes } = data;
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", status: 404 };
      }
      const socialMedia = {
        link,
        mediaTypes,
      };
      // verify if mediaTypes is in the array socialMedia.mediaTypes
      if(!user.socialMedia.some((item) => item.mediaTypes === mediaTypes)) {
        await User.findOneAndUpdate(
          { _id: user_id },
          { $push: { socialMedia } },
          { new: true }
        );
        return { message: "Social media link added", status: "success" };
      } else {
        return { error: "Can not add link...", status: 404 };
      }
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

}
