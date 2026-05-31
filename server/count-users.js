import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./Models/UserModel.js";

dotenv.config();

async function countUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const totalUsersCount = await UserModel.countDocuments();
    console.log("Total users in database:", totalUsersCount);

    const users = await UserModel.find({}, "firstName lastName email username");
    console.log("User profiles in database:");
    console.log(JSON.stringify(users, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

countUsers();
