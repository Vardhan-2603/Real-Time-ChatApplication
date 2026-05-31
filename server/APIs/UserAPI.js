import express from "express";
import { UserModel } from "../Models/UserModel.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/verifyToken.js";
import { MessageModel } from "../Models/MessageModel.js";
import { ChannelModel } from "../Models/ChannelModel.js";
import mongoose from "mongoose";
import { upload } from "../middleware/upload.js";

export const userRouter = express.Router();

userRouter.get("/check-auth", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ payload: user });
  } catch (error) {
    console.error("check-auth error:", error);
    return res.status(500).json({ error: "Server error checking authentication" });
  }
});

userRouter.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ available: false });

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
      return res.json({
        available: false,
        message: "Username must start with an alphabet letter and contain only letters, numbers, and underscores.",
      });
    }

    const existing = await UserModel.findOne({
      username: username.toLowerCase(),
    });
    if (existing) {
      return res.json({
        available: false,
        message: "Username is already taken",
      });
    }
    return res.json({ available: true, message: "Username is available" });
  } catch (error) {
    return res.status(500).json({ error: "Server error checking username" });
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    await UserModel.syncIndexes();

    let userObj = req.body;

    if (userObj.username && userObj.username.trim() !== "") {
      const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if (!usernameRegex.test(userObj.username)) {
        return res.status(400).json({
          error: "Username must start with an alphabet letter and contain only letters, numbers, and underscores.",
        });
      }
    } else {
      delete userObj.username;
    }

    if (!userObj.email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userObj.email)) {
      return res.status(400).json({
        error: "Invalid email format. The email local part must start with a letter and have a valid domain.",
      });
    }

    let userDoc = new UserModel(userObj);
    await userDoc.validate();

    userDoc.password = await hash(userDoc.password, 12);

    const created = await userDoc.save();

    const newUserObj = created.toObject();

    delete newUserObj.password;

    res.status(201).json({ message: "User created", payload: newUserObj });
  } catch (err) {
    console.log("Registration Error: ", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ error: `${field} is already in use.` });
    }
    return res
      .status(500)
      .json({ error: err.message || "Registration failed" });
  }
});

userRouter.post("/login", async (req, res) => {
  const newUserObj = req.body;

  const user = await UserModel.findOne({ email: newUserObj.email });

  if (!user) {
    return res.status(404).json({ message: "User not found, please register" });
  }

  const isMatch = await compare(newUserObj.password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "please enter a valid password" });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.cookie("token", token, {

  httpOnly: true,

  secure: false,

  sameSite: "lax",

  maxAge:
    1000 * 60 * 60 * 24 * 7,

});
  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({ message: "Login Success", payload: userObj });
});

userRouter.patch("/change-password", verifyToken, async (req, res) => {
  let { email, currentPassword, newPassword } = req.body;
  let user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const isMatch = await compare(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error("Invalid password");
    err.status = 401;
    throw err;
  }

  let createdNewPassword = await hash(newPassword, 12);
  let updated = await UserModel.findOneAndUpdate(
    { email },
    { $set: { password: createdNewPassword } },
    { new: true },
  );

  const newUserObj = updated.toObject();

  delete newUserObj.password;

  res
    .status(200)
    .json({ message: "Password Updated Successfully", payload: newUserObj });
});

userRouter.get("/logout", verifyToken, async (req, res) => {
  res.clearCookie("token", {

  httpOnly: true,

  secure: false,

  sameSite: "lax",

});
  res.status(200).json({ message: "logged out successfully" });
});

userRouter.get("/user", verifyToken, async (req, res) => {
  try {
    let keyword = {};
    if (req.query.search) {
      const searchStr = req.query.search.trim();
      const searchTerms = searchStr.split(/\s+/);

      if (searchTerms.length > 1) {
        keyword = {
          $and: [
            { firstName: { $regex: searchTerms[0], $options: "i" } },
            { lastName: { $regex: searchTerms[1], $options: "i" } },
          ],
        };
      } else {
        keyword = {
          $or: [
            { firstName: { $regex: searchStr, $options: "i" } },
            { lastName: { $regex: searchStr, $options: "i" } },
            { email: { $regex: searchStr, $options: "i" } },
            { username: { $regex: searchStr, $options: "i" } },
          ],
        };
      }
    }

    const users = await UserModel.find(keyword)
      .find({
        _id: { $ne: req.user.userId },
      })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

userRouter.get("/profile-stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await MessageModel.find({
      $or: [
        { sender: new mongoose.Types.ObjectId(userId) },
        { receiver: new mongoose.Types.ObjectId(userId) },
      ],
    });
    const connectionsSet = new Set();

    messages.forEach((msg) => {
      if (msg.sender.toString() === userId.toString() && msg.receiver) {
        connectionsSet.add(msg.receiver.toString());
      }
      if (msg.receiver?.toString() === userId.toString()) {
        connectionsSet.add(msg.sender.toString());
      }
    });

    const channels = await ChannelModel.countDocuments({
      members: new mongoose.Types.ObjectId(userId),
    });

    const messageCount = messages.length;

    const user = await UserModel.findById(userId);

    res.status(200).json({
      payload: {
        connections: connectionsSet.size,
        channels,
        messages: messageCount,
        memberSince: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile stats" });
  }
});

userRouter.post("/update-profile-pic", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    let profilePicUrl = "";
    if (req.file) {
      profilePicUrl = req.file.path; // Cloudinary URL from upload middleware
    } else {
      profilePicUrl = req.body.profilePic; // Fallback to raw string URL
    }

    if (!profilePicUrl) {
      return res.status(400).json({ message: "No profile picture provided" });
    }

    const updated = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { profilePic: profilePicUrl },
      { new: true },
    ).select("-password");

    res.json({ payload: updated });
  } catch (err) {
    console.error("Profile pic update error:", err);
    res.status(500).json({ message: "Error updating profile pic" });
  }
});

userRouter.post("/save-note", verifyToken, async (req, res) => {
  try {
    const { note } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { $set: { note } },
      { new: true },
    );

    res.json({
      payload: updatedUser.note || "",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving note" });
  }
});

userRouter.get("/get-notes", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);

    res.json({ payload: user.notes || [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

userRouter.post("/add-note", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      {
        $push: {
          notes: { text },
        },
      },
      { new: true },
    );

    res.json({ payload: updatedUser.notes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding note" });
  }
});

userRouter.delete("/delete-note/:index", verifyToken, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const user = await UserModel.findById(req.user.userId);

    user.notes.splice(index, 1);

    await user.save();

    res.json({ payload: user.notes });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
});
