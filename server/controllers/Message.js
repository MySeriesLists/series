import mongoose from "mongoose";
import MessageSchema from "../models/Message.js";
import { User } from "../models/User.js";

export default class Message {
  constructor() {}

  /**
   *
   * @param {mongoId} sender
   * @param {mongoId} receiver
   * @param {string} message
   * @description Create new message
   * @returns
   */
  async createMessage(sender, receiver, message) {
    try {
      const users = await User.find({ _id: { $in: [sender, receiver] } });
      console.log("users", users);
      if (users.length !== 2) {
        return { error: "Invalid sender or receiver", status: 400 };
      }
      if (!message) {
        return { error: "Message is required", status: 400 };
      }
      const newMessage = new MessageSchema({
        sender,
        receiver,
        message,
      });
      return await newMessage.save();
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * @param {mongoId} sender
   * @param {mongoId} receiver
   * @description get all messages between two users
   * @returns
   */
  async getMessages(sender, receiver, offset, limit) {
    try {
      const messages = await MessageSchema.find({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
      })
        .sort({ date: -1 })
        .skip(offset)
        .limit(limit);
      limit = messages.length > limit ? limit + 10 : 0;
      return { messages, limit };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }
}
