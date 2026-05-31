import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

// =====================================================
// CLOUDINARY CONFIG
// =====================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// LOCAL STORAGE SETUP
// =====================================================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[()]/g, "");
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const localMulter = multer({
  storage: diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB
  },
});

// =====================================================
// HYBRID UPLOAD MIDDLEWARE WRAPPER
// =====================================================
export const upload = {
  single: (fieldname) => {
    const localUploadMiddleware = localMulter.single(fieldname);

    return (req, res, next) => {
      localUploadMiddleware(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        if (!req.file) {
          return next();
        }

        const localPath = req.file.path;

        try {
          // Construct folder, publicId, and resource type matching the original implementation
          const folder = "chat_app_uploads";
          const sanitizedOriginalName = req.file.originalname
            .replace(/\s+/g, "-")
            .replace(/[()]/g, "");
          const publicId = `${Date.now()}-${sanitizedOriginalName}`;

          const origNameLower = req.file.originalname.toLowerCase();
          const isRaw =
            origNameLower.endsWith(".zip") ||
            origNameLower.endsWith(".rar") ||
            origNameLower.endsWith(".7z");
          const resourceType = isRaw ? "raw" : "auto";

          console.log(`[Upload Middleware] Uploading local temp file to Cloudinary: ${localPath}`);
          const result = await cloudinary.uploader.upload(localPath, {
            folder,
            resource_type: resourceType,
            public_id: publicId,
          });

          console.log(`[Upload Middleware] Cloudinary upload successful: ${result.secure_url}`);
          
          // Replace req.file.path with Cloudinary URL
          req.file.path = result.secure_url;

          // Delete the temporary local file
          try {
            fs.unlinkSync(localPath);
            console.log(`[Upload Middleware] Cleaned up temporary local file: ${localPath}`);
          } catch (unlinkErr) {
            console.error("[Upload Middleware] Failed to delete local temp file:", unlinkErr);
          }
        } catch (cloudinaryErr) {
          console.error(
            "[Upload Middleware] Cloudinary upload failed. Falling back to local storage URL.",
            cloudinaryErr
          );

          // Log Cloudinary failure to server-errors.log
          try {
            const errorLogPath = path.join(process.cwd(), "server-errors.log");
            const logMessage = `${new Date().toISOString()} - [Upload Middleware] Cloudinary Error: ${
              cloudinaryErr.message
            }\n${cloudinaryErr.stack || ""}\n\n`;
            fs.appendFileSync(errorLogPath, logMessage);
          } catch (logErr) {
            console.error("[Upload Middleware] Failed to write to server-errors.log:", logErr);
          }

          // Fallback: Construct local server URL served by express.static("/uploads")
          const localUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
          req.file.path = localUrl;
          console.log(`[Upload Middleware] Fallback path set to: ${req.file.path}`);
        }

        next();
      });
    };
  },
};