import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Configured Cloudinary:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret length:", process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0);

async function testConnection() {
  try {
    console.log("Attempting ping to Cloudinary...");
    const result = await cloudinary.api.ping();
    console.log("Ping success! Connection is valid:", result);
  } catch (error) {
    console.error("Ping failed! Cloudinary error details:", error);
  }
}

testConnection();
