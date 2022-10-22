import Club from "../models/Club/Club.js";
import ClubEvent from "../models/Club/Event.js";
import ClubDiscussion from "../models/Club/Discussion.js";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export default class ClubController {
  constructor() {}

  // create a new club
  async createClub(data) {
    try {
      const { name, description, image, user_id } = data;
      if (!name || !description || !user_id) {
        return {
          status: 400,
          message: "Bad request, nae description is mandatory.",
        };
      }

      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return { status: 404, message: "User not found" };
      }

      const club = await Club.findOne({ name });
      if (club) {
        return {
          status: 400,
          message: "Club already exists, please chose another name!",
        };
      }
      //insert new club into database
      const newClub = new Club({ name, description, image, user_id });
      //add user to club members and add user to club admins
      newClub.members.push(user_id);
      newClub.admins.push(user_id);
      await newClub.save();
      //return new club
      return {
        status: 200,
        message: "Club created successfully",
        club: newClub,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // get all clubs
  async getAllClubs(offset, limit) {
    try {
      !offset ? (offset = 0) : (offset = offset);
      !limit ? (limit = 10) : (limit = limit);
      console.log(offset, limit);
      const clubs = await Club.find()
        .select("name description image _id")
        .sort({ name: -1 });
      const clubsCount = await Club.countDocuments();
      let nextPage =
        parseInt(offset) + parseInt(limit) < clubsCount ? limit + 10 : null;

      return {
        status: 200,
        message: "Clubs found successfully",
        clubs,
        nextPage,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // list all club members
  async getAllMembers(club_id) {
    try {
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const members = await User.find({ _id: { $in: club.members } }).select(
        "username image _id"
      );
      const admins = await User.find({ _id: { $in: club.admins } }).select(
        "username image _id"
      );
      const membersCount = members.length;
      const adminsCount = admins.length;
      return {
        status: 200,
        message: "Members found successfully",
        members,
        admins,
        membersCount,
        adminsCount,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // get a club by name
  async getClubByName(name) {
    try {
      if (!name) {
        return { status: 400, message: "Bad request, name is mandatory." };
      }
      const club = await Club.findOne({ name }).select(
        "name description image members _id"
      );
      club.members = club.members.length;
      if (!club) {
        return { status: 404, error: "Club not found" };
      }
      return { status: 200, message: "Club found successfully", club };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // add a member to a club
  async addMember(data) {
    try {
      const { club_id, user_id } = data;
      if (!club_id || !user_id) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      //check if user is already a member or banned
      if (club.members.includes(user_id) || club.banned.includes(user_id)) {
        return { status: 400, message: "Can not add this user." };
      }

      // verify if user can auto join or needs approval, if auto join add user to members, if not add user to pending
      club.autoJoin ? club.members.push(user_id) : club.pending.push(user_id);
      await club.save();
      return { status: 200, message: "User added successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // remove a member from a club
  async removeMember(data) {
    try {
      const { club_id, user_id, user_to_remove_id } = data;
      if (!club_id || !user_id || !user_to_remove_id) {
        return {
          status: 400,
          message: "Bad request, club_id and user_to_remove_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }

      // can not remove a member if he is the only admin, or if he is not a member
      if (
        !club.members.includes(user_to_remove_id) ||
        !club.admins.includes(user_to_remove_id) ||
        club.admins.includes(user_to_remove_id) ||
        club.admins.length === 1 ||
        club.members.length === 1
      ) {
        return { status: 400, message: "Can not remove this user." };
      }
      // remove user from club members
      club.members.pull(user_id);
      await club.save();
      return { status: 200, message: "User removed successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // get all admins
  async getAllAdmins(club_id) {
    try {
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const admins = await User.find({ _id: { $in: club.admins } }).select(
        "username image _id"
      );
      const adminsCount = admins.length;
      return {
        status: 200,
        message: "Admins found successfully",
        admins,
        adminsCount,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // add an admin to a club
  async addAdmin(data) {
    try {
      const { club_id, user_id, user_to_add_as_admin } = data;
      if (!club_id || !user_id || !user_to_add_as_admin) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }

      //check if user is already an admin or banned
      if (
        club.admins.includes(user_to_add_as_admin) ||
        club.banned.includes(user_to_add_as_admin) ||
        !club.members.includes(user_id)
      ) {
        return { status: 400, message: "Can not add this user." };
      }

      // add user to club admins if admins.length < 3
      if (club.admins.length <= 7) {
        club.admins.push(user_to_add_as_admin);
        await club.save();
        return { status: 200, message: "User added successfully" };
      } else {
        return { status: 400, message: "Can not add more then 7 users." };
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // remove an admin from a club
  async removeAdmin(data) {
    try {
      const { club_id, user_id, user_to_remove_as_admin } = data;
      if (!club_id || !user_id || !user_to_remove_as_admin) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }

      // can not remove an admin if he is the only admin
      if (
        !club.admins.includes(user_to_remove_as_admin) ||
        club.admins.length === 1
      ) {
        return { status: 400, message: "Can not remove this user." };
      }
      // remove user from club admins
      club.admins.pull(user_to_remove_as_admin);
      await club.save();
      return { status: 200, message: "User removed successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  //ban a user from a club
  async banUser(data) {
    try {
      const { club_id, user_id, user_to_ban } = data;
      if (!club_id || !user_id || !user_to_ban) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }

      // can not ban a user if he is the only admin
      if (!club.admins.includes(user_to_ban) || club.admins.length === 1) {
        return { status: 400, message: "Can not ban this user." };
      }
      // remove user from club admins
      club.admins.pull(user_to_ban);
      // add user to club banned
      club.banned.push(user_to_ban);
      await club.save();
      return { status: 200, message: "User banned successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  //unban a user from a club
  async unbanUser(data) {
    try {
      const { club_id, user_id, user_to_unban } = data;
      if (!club_id || !user_id || !user_to_unban) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }

      // can not unban a user if he is not banned
      if (!club.banned.includes(user_to_unban)) {
        return { status: 400, message: "Can not unban this user." };
      }
      // remove user from club banned
      club.banned.pull(user_to_unban);
      await club.save();
      return { status: 200, message: "User unbanned successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // get all banned users
  async getAllBannedUsers(club_id) {
    try {
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const banned = await User.find({ _id: { $in: club.banned } }).select(
        "username image _id"
      );
      const bannedCount = banned.length;
      return {
        status: 200,
        message: "Banned users found successfully",
        banned,
        bannedCount,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // get all pending members
  async getAllPendingMembers(club_id) {
    try {
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const pending = await User.find({ _id: { $in: club.pending } }).select(
        "username image _id"
      );
      const pendingCount = pending.length;
      return {
        status: 200,
        message: "Pending members found successfully",
        pending,
        pendingCount,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // approve a pending member
  async approvePendingMember(data) {
    try {
      const { club_id, user_id, user_to_approve, approved } = data;
      if (!club_id || !user_id || !user_to_approve) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }

      // can not approve a user if he is not pending
      if (!club.pending.includes(user_to_approve)) {
        return { status: 400, message: "Can not approve this user." };
      }
      // remove user from club pending
      club.pending.pull(user_to_approve);
      // add user to club members, if approved is true
      if (approved) {
        club.members.push(user_to_approve);
      }
      await club.save();
      return { status: 200, message: "User approved successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // disable a club
  async disableClub(data) {
    try {
      const { club_id, user_id, isEnabled } = data;
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      isEnabled ? (club.disabled = false) : (club.disabled = true);
      await club.save();
      return { status: 200, message: "Club disabled successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // write a discussion
  async writeDiscussionPost(data) {
    try {
      const { club_id, user_id, post_title, post_description } = data;
      if (!club_id || !user_id || !post_title || !post_description) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const discussion = new ClubDiscussion({
        title : post_title,
        description : post_description,
        creator: user_id,
        clubId: club_id,
      });
      await discussion.save();
      return { status: 200, message: "Discussion created successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // get all discussions
  async getAllDiscussionPosts(club_id, offset, limit) {
    try {
      const club = await Club.findOne({ _id: club_id });
      !offset ? (offset = 0) : (offset = offset);
      !limit ? (limit = 10) : (limit = limit);
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const discussions = await ClubDiscussion.find({ clubId: club_id })
        .skip(offset)
        .limit(limit)
        .populate("creator", "username image _id")
        .sort({ createdAt: -1 });
      const discussionsCount = await ClubDiscussion.countDocuments({
        clubId: club_id,
      });
      console.log(discussions[0].creator);
      let nextPage = (discussionsCount - offset - limit) > 0 ? (limit +10) : null;
      return {
        status: 200,
        message: "Discussions found successfully",
        discussions,
        discussionsCount,
        nextPage
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }


  // delete a discussion
  async deleteDiscussionPost(data) {
    try {
      const { club_id, user_id, post_id } = data;
      if (!club_id || !user_id || !post_id) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const discussion = await ClubDiscussion.findOne({ _id: post_id });
      if (!discussion) {
        return { status: 404, message: "Discussion not found" };
      }
      await discussion.remove();
      return { status: 200, message: "Discussion deleted successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // write a comment
  async writeComment(data) {
    try {
      const { club_id, user_id, post_id, comment } = data;
      if (!club_id || !user_id || !post_id || !comment) {
        return {
          status: 400,
          message: "Bad request, club_id and user_id are mandatory.",
        };
      }
      const club = await Club.findOne({ _id: club_id });
      if (!club) {
        return { status: 404, message: "Club not found" };
      }
      const discussion = await ClubDiscussion.findOne({ _id: post_id });
      if (!discussion) {
        return { status: 404, message: "Discussion not found" };
      }
      const newComment = {
        comment,
        creator: user_id,
      };
      ClubComment.create(newComment, (err, comment) => {
        if (err) {
          console.log(err);
          return err;
        }
        comment.push(comment);
      }
      );
      await ClubComment.save();
      return { status: 200, message: "Comment created successfully" };
    } catch (error) {
      console.log(error);
      return error;
    }
  }


}
