import { upload } from "./middleware/upload.js";
import express from "express";
import fs from "fs";

const app = express();

console.log("Mocking upload middleware execution...");

// Create a dummy image file for upload testing
fs.writeFileSync("dummy.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));

// Mock Express request, response, and next objects
const req = {
  headers: {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
  },
  // We can pass a mock read stream for the file, but since multer handles parsing internally,
  // let's define a simpler test to call the storage engine directly to see if it throws!
};

console.log("Storage engine configuration:", upload.storage);

async function testStorageEngine() {
  try {
    const mockFile = {
      fieldname: "profilePic",
      originalname: "my_avatar.png",
      mimetype: "image/png",
    };

    console.log("Calling storage.getFilename (or storage._handleFile) with mock file...");
    // Mongoose CloudinaryStorage resolves params
    // Let's call storage.params directly to see if it resolves without error!
    if (upload.storage.params) {
      const params = await upload.storage.params(null, mockFile);
      console.log("CloudinaryStorage params resolved successfully:", params);
    } else {
      console.log("storage.params is not defined");
    }
  } catch (error) {
    console.error("Storage engine failed to resolve params! Error:", error);
  } finally {
    // Clean up dummy file
    try { fs.unlinkSync("dummy.png"); } catch(e) {}
  }
}

testStorageEngine();
