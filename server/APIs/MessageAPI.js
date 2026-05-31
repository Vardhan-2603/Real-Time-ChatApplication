import exp from "express";
import { MessageModel } from "../Models/MessageModel.js";
import { UserModel } from "../Models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { upload } from "../middleware/upload.js";

export const messageRoute = exp.Router();

/* ======================================================
   SEND MESSAGE WITH FILE SUPPORT
====================================================== */

messageRoute.post(
  "/send",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const { content, receiver, channel, parentMessage, clientMessageId } = req.body;
    try {
      const sender = req.user.userId;

      if (clientMessageId) {
        const existing = await MessageModel.findOne({ clientMessageId })
          .populate("sender", "firstName lastName email profilePic")
          .populate("parentMessage");
        if (existing) {
          return res.status(200).json({
            message: "Message Sent",
            payload: existing,
          });
        }
      }

      let fileUrl = "";
      let fileName = "";
      let fileType = "";

      // If file uploaded
      if (req.file) {
        fileUrl = req.file.path; 
        fileName = req.file.originalname;
        fileType = req.file.mimetype;
      }

      if (!content && !req.file) {
        return res.status(400).json({
          error: "Message or file is required",
        });
      }

      if (!receiver && !channel) {
        return res.status(400).json({
          error: "Must specify a receiver or a channel",
        });
      }

      const newMessage = new MessageModel({
        sender,
        content,
        fileUrl,
        fileName,
        fileType,
        parentMessage: parentMessage || null,
        ...(clientMessageId && { clientMessageId }),
        ...(receiver && { receiver }),
        ...(channel && { channel }),
      });

      await newMessage.save();

      const populatedNewMessage = await MessageModel.findById(newMessage._id)
        .populate("sender", "firstName lastName email profilePic")
        .populate("parentMessage");

      console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      console.log("NEW MESSAGE:", populatedNewMessage);

      res.status(201).json({
        message: "Message Sent",
        payload: populatedNewMessage,
      });
    } catch (err) {
      if (err.code === 11000 || (err.writeErrors && err.writeErrors.some(e => e.code === 11000))) {
        if (clientMessageId) {
          try {
            const existing = await MessageModel.findOne({ clientMessageId })
              .populate("sender", "firstName lastName email profilePic")
              .populate("parentMessage");
            if (existing) {
              return res.status(200).json({
                message: "Message Sent",
                payload: existing,
              });
            }
          } catch (findErr) {
            console.log("Error finding existing message:", findErr);
          }
        }
      }
      console.log("Error details:", err);
      res.status(500).json({
        error: "Server Error",
      });
    }
  },
);

/* ======================================================
   GET PERSONAL CHAT MESSAGES
====================================================== */

messageRoute.get("/messages/:id", verifyToken, async (req, res) => {
  let myId = req.user.userId;
  let chatPartnerId = req.params.id;

  let messages = await MessageModel.find({
    $or: [
      { sender: myId, receiver: chatPartnerId },
      { sender: chatPartnerId, receiver: myId },
    ],
  })
    .sort({ createdAt: 1 })

    .populate("sender", "firstName lastName email profilePic")
    .populate("reactions.users", "firstName lastName email")
    .populate("parentMessage");

  res.status(200).json({
    message: "List of Messages:",
    payload: messages,
  });
});

/* ======================================================
   SIDEBAR USERS
====================================================== */

messageRoute.get("/sidebar-users", verifyToken, async (req, res) => {
  const myId = req.user.userId;

  const messages = await MessageModel.find({
    $or: [{ sender: myId }, { receiver: myId }],
  }).sort({ createdAt: -1 });

  const contactIds = new Set();

  messages.forEach((msg) => {

  if (
    msg.sender?.toString() === myId.toString() &&
    msg.receiver
  ) {
    contactIds.add(msg.receiver.toString());
  }

  if (
    msg.receiver?.toString() === myId.toString() &&
    msg.sender
  ) {
    contactIds.add(msg.sender.toString());
  }

});
  const contactIdsArray = Array.from(contactIds);

  const sidebarUsers = await UserModel.find({
    _id: { $in: Array.from(contactIds) },
  }).select("-password");

  sidebarUsers.sort((a, b) => {
    return (
      contactIdsArray.indexOf(a._id.toString()) -
      contactIdsArray.indexOf(b._id.toString())
    );
  });

  res.status(200).json({
    message: "Sidebar users loaded",
    payload: sidebarUsers,
  });
});

/* ======================================================
   CHANNEL MESSAGES
====================================================== */

messageRoute.get(
  "/channel-messages/:channelId",
  verifyToken,
  async (req, res) => {
    let channelId = req.params?.channelId;

    let allChannelMessage = await MessageModel.find({
      channel: channelId,
    })
      .sort({ createdAt: 1 })

      .populate("sender", "firstName lastName email profilePic")
      .populate("reactions.users", "firstName lastName email")
      .populate("parentMessage");

    res.status(200).json({
      message: "all channel message",
      payload: allChannelMessage,
    });
  },
);

/* ======================================================
   REACTIONS API
====================================================== */

messageRoute.post("/messages/:messageId/react", async (req, res) => {
  const { emoji, userId } = req.body;
  const { messageId } = req.params;

  const message = await MessageModel.findById(messageId);

  if (!message) {
    return res.status(404).json({
      message: "Message not found",
    });
  }

  if (!message.reactions) {
    message.reactions = [];
  }

  const existingIndex = message.reactions.findIndex(
    (r) => r.userId.toString() === userId.toString(),
  );

  if (existingIndex !== -1) {
    const existing = message.reactions[existingIndex];

    if (existing.emoji === emoji) {
      message.reactions.splice(existingIndex, 1);
    } else {
      existing.emoji = emoji;
    }
  } else {
    message.reactions.push({ userId, emoji });
  }

  await message.save();

  const updatedMessage = await MessageModel.findById(messageId)
    .populate("sender", "firstName lastName email profilePic")
    .populate("reactions.users", "firstName lastName email")
    .populate("parentMessage");

  const io = req.app.get("socketio");

  if (message.channel) {
    io.to(message.channel.toString()).emit("reactionUpdated", updatedMessage);
  } else {
    io.to(message.receiver.toString())
      .to(message.sender.toString())
      .emit("reactionUpdated", updatedMessage);
  }

  res.status(200).json({
    message: "Reaction added successfully",
    payload: updatedMessage,
  });
});

export default messageRoute;