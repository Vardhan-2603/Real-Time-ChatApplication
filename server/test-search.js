import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./Models/UserModel.js";

dotenv.config();

async function runSearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const searchStr = "test";
    const keyword = {
      $or: [
        { firstName: { $regex: searchStr, $options: "i" } },
        { lastName: { $regex: searchStr, $options: "i" } },
        { email: { $regex: searchStr, $options: "i" } },
        { username: { $regex: searchStr, $options: "i" } },
      ],
    };

    const currentUserId = "6a1bf2ed09d8fa6fb2aec6d7"; // Vardhan's ID

    const users = await UserModel.find(keyword)
      .find({
        _id: { $ne: currentUserId },
      })
      .select("-password");

    console.log("Found users count:", users.length);
    console.log("Found users:", JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

runSearch();
