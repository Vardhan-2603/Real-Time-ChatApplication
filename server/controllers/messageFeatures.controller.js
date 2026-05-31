import { MessageModel } from "../Models/MessageModel.js";

/* ======================================================
   EDIT MESSAGE
====================================================== */

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const { content } = req.body;

    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content required",
      });
    }

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not allowed to edit this message",
      });
    }

    message.content = content;

    message.isEdited = true;

    message.editedAt = new Date();

    await message.save();

    const populated = await MessageModel.findById(message._id)
      .populate("sender", "firstName lastName email profilePic")
      .populate("receiver", "firstName lastName email profilePic")
      .populate("parentMessage");

    const io = req.app.get("socketio");

    if (message.channel) {
      io.to(message.channel.toString()).emit("message edited", populated);
    } else {
      io.to(message.receiver.toString())
        .to(message.sender.toString())
        .emit("message edited", populated);
    }

    res.status(200).json({
      message: "Message edited successfully",

      payload: populated,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ======================================================
   SEND THREAD REPLY
====================================================== */

export const sendThreadReply = async (req, res) => {
  const { parentMessageId } = req.params;
  const { content, clientMessageId } = req.body;
  try {
    const sender = req.user.userId;

    if (clientMessageId) {
      const existing = await MessageModel.findOne({ clientMessageId })
        .populate("sender", "firstName lastName email profilePic")
        .populate("parentMessage");
      if (existing) {
        return res.status(200).json({
          message: "Thread reply sent",
          payload: existing,
        });
      }
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Reply content required",
      });
    }

    const parentMessage = await MessageModel.findById(parentMessageId);

    if (!parentMessage) {
      return res.status(404).json({
        message: "Parent message not found",
      });
    }

    /* =========================================
         FIXED RECEIVER + CHANNEL LOGIC
      ========================================= */

    let receiver = undefined;

    let channel = undefined;

    if (parentMessage.channel) {
      channel = parentMessage.channel;
    } else {
      const parentSender = parentMessage.sender.toString();

      const parentReceiver = parentMessage.receiver.toString();

      if (parentSender === sender.toString()) {
        receiver = parentReceiver;
      } else {
        receiver = parentSender;
      }
    }

    const newReply = new MessageModel({
      sender,

      receiver,

      channel,

      content,

      parentMessage: parentMessageId,
      ...(clientMessageId && { clientMessageId }),
    });

    await newReply.save();

    const populatedReply = await MessageModel.findById(newReply._id)
      .populate("sender", "firstName lastName email profilePic")
      .populate("parentMessage");

    const io = req.app.get("socketio");

    if (channel) {
      io.to(channel.toString()).emit("thread reply", populatedReply);
    } else {
      io.to(receiver.toString())
        .to(sender.toString())
        .emit("thread reply", populatedReply);
    }

    res.status(201).json({
      message: "Thread reply sent",

      payload: populatedReply,
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
              message: "Thread reply sent",
              payload: existing,
            });
          }
        } catch (findErr) {
          console.log("Error finding existing thread reply:", findErr);
        }
      }
    }
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ======================================================
   GET THREAD REPLIES
====================================================== */

export const getThreadReplies = async (req, res) => {
  try {
    const { parentMessageId } = req.params;

    const replies = await MessageModel.find({
      parentMessage: parentMessageId,
    })

      .sort({
        createdAt: 1,
      })

      .populate("sender", "firstName lastName email profilePic");

    res.status(200).json({
      message: "Thread replies fetched",

      payload: replies,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ======================================================
   MARK MESSAGES AS SEEN (BLUE TICKS)
====================================================== */

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.userId; // The user who just opened the chat

    if (!senderId) {
      return res.status(400).json({
        message: "Sender ID is required",
      });
    }

    await MessageModel.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        status: { $ne: "seen" },
      },
      {
        $set: { status: "seen" },
      },
    );

    const io = req.app.get("socketio");

    io.to(senderId.toString()).emit("messagesSeen", {
      receiverId: receiverId,
    });

    res.status(200).json({
      message: "Messages marked as seen",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
/* ======================================================
   REACT TO MESSAGE
====================================================== */

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji required" });
    }

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReactionIndex = message.reactions.findIndex(
      (reaction) => reaction.emoji === emoji
    );

    if (existingReactionIndex !== -1) {
      const existingReaction = message.reactions[existingReactionIndex];
      const userIndex = existingReaction.users.findIndex(
        (id) => id.toString() === userId.toString()
      );

      if (userIndex !== -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions.splice(existingReactionIndex, 1);
        }
      } else {
        existingReaction.users.push(userId);
      }
    } else {
      message.reactions.push({
        emoji,
        users: [userId],
      });
    }

    await message.save();

    const updatedMessage = await MessageModel.findById(messageId).populate(
      "sender",
      "firstName lastName email profilePic"
    );

    const io = req.app.get("socketio");

    if (updatedMessage.channel) {
      io.to(updatedMessage.channel.toString()).emit("reactionUpdated", updatedMessage);
    } else {
      io.to(updatedMessage.receiver.toString())
        .to(updatedMessage.sender.toString())
        .emit("reactionUpdated", updatedMessage);
    }

    res.status(200).json({ payload: updatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};