import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { ChannelModel } from "../Models/ChannelModel.js";
import { MessageModel } from "../Models/MessageModel.js"; // NEED THIS FOR SORTING

export const channelRoute = express.Router();

channelRoute.post("/create", verifyToken, async (req, res) => {
  let { name, members } = req.body;
  let admin = req.user?.userId;

  if (!members) members = [];

  members.push(admin);

  let channelDoc = new ChannelModel({
    name: name,
    admin: admin,
    members: members,
  });
  await channelDoc.validate();

  let newChannel = await channelDoc.save();

  res.status(201).json({ message: "channel created", payload: newChannel });
});

channelRoute.get("/my-channels", verifyToken, async (req, res) => {
  let currUser = req.user?.userId;

  let allChannels = await ChannelModel.find({ members: currUser }).lean();

  for (let channel of allChannels) {
    const latestMessage = await MessageModel.findOne({
      channel: channel._id,
    }).sort({ createdAt: -1 });
    channel.lastMessageTime = latestMessage
      ? new Date(latestMessage.createdAt).getTime()
      : new Date(channel.createdAt || 0).getTime();
  }

  allChannels.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  res.status(200).json({ message: "your channels", payload: allChannels });
});
