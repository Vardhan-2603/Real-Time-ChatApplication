import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "chat_app_uploads",
    resource_type: "auto",
    public_id: `${Date.now()}-test-file`,
  }),
});

async function runTest() {
  try {
    console.log("Testing CloudinaryStorage upload wrapper...");
    
    // Mock the file object that Multer sends to the storage engine
    const mockFile = {
      fieldname: "profilePic",
      originalname: "test.png",
      mimetype: "image/png",
      stream: null,
    };

    // Let's do a direct test upload of a dummy image buffer to verify Cloudinary accepts the config
    console.log("Uploading a dummy image buffer directly to Cloudinary...");
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "chat_app_uploads",
          public_id: `${Date.now()}-test-upload`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
    });

    console.log("Upload test success! Cloudinary URL:", uploadResult.secure_url);

    // Let's try calling storage._handleFile with a mock stream of the dummy file to see if multer storage works
    console.log("Testing storage._handleFile with mock stream...");
    const { Readable } = await import("stream");
    const mockStream = Readable.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
    const mockFileWithStream = {
      ...mockFile,
      stream: mockStream,
    };

    const handleFileResult = await new Promise((resolve, reject) => {
      storage._handleFile(null, mockFileWithStream, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log("storage._handleFile success! Result:", handleFileResult);

  } catch (error) {
    console.error("Test failed! Full Error details:");
    console.dir(error, { depth: null });
    console.log("Error keys:", Object.keys(error));
    console.log("Error own property names:", Object.getOwnPropertyNames(error));
    for (const key of Object.getOwnPropertyNames(error)) {
      console.log(`error[${key}] =`, error[key]);
    }
  }
}

runTest();
