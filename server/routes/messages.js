import MessageController from "../controllers/Message.js";
import express from "express";

const messageRouter = express.Router();

/**
 * @middleware  - check if user is logged in
 * @description - check if user is logged in
 * @param       - req, res, next
 * @returns     - next()
 * @access      - logged in user
 */

messageRouter.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.status(401).send({ error: "Unauthorized" });
  }
});

/**
 * @route       - POST /
 * @description - test route
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 */

messageRouter.get("/", (req, res) => {
  console.log("req.session.user", req.session.user);
  return res.send("You are logged in");
});
/**
 * @route       - POST /send-message
 * @description - send message
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - sender, receiverId, message
 * @bodyType    - string, string, string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a", "5f9f1b9b0b1b9c0b8c8b9b9a", "This is a message"
 * @response    - {status: "success", message: message}
 * @responseType - {string, object}
 * @access      - logged in user
 * 
 */
messageRouter.post("/send-message", async (req, res) => {
  try {
    const sender = req.session.user;
    const {  receiver, message } = req.body;
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
/**
 * @route       - POST /get-messages
 * @description - get messages
 * @param       - req, res
 * @returns     - res
 * @access      - logged in user
 * @body        - sender, receiverId
 * @bodyType    - string, string
 * @bodyExample - "5f9f1b9b0b1b9c0b8c8b9b9a", "5f9f1b9b0b1b9c0b8c8b9b9a"
 * @response    - {status: "success", messages: messages}
 * @responseType - {string, object}
 * @access      - logged in user
 */

messageRouter.get("/get-messages", async (req, res) => {
  try {

    const sender = req.session.user;
    let {  receiver, offset, limit } = req.query;
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
