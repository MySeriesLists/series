import MessageController from "../controllers/Message.js";
import express from "express";

const messageRouter = express.Router();

messageRouter.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.status(401).send({ error: "Unauthorized" });
  }
});

messageRouter.get("/", (req, res) => {
  console.log("req.session.user", req.session.user);
  return res.send("You are logged in");
});

messageRouter.post("/send-message", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    if (sender !== req.session.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    const messageController = new MessageController();
    const response = await messageController.createMessage(
      sender,
      receiver,
      message
    );
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

messageRouter.get("/get-messages", async (req, res) => {
  try {
    let { sender, receiver, offset, limit } = req.query;
    console.log("sender", sender);
    console.log(req.session.user);
    if (sender !== req.session.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    !offset ? (offset = 0) : (offset = offset);
    !limit ? (limit = 10) : (limit = limit);
    const messageController = new MessageController();
    const response = await messageController.getMessages(
      sender,
      receiver,
      offset,
      limit
    );
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

export default messageRouter;
