import multer from "multer";

import { v2 as cloudinary }
from "cloudinary";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import dotenv from "dotenv";

dotenv.config();



// =====================================================
// CLOUDINARY CONFIG
// =====================================================

cloudinary.config({

  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

});



// =====================================================
// STORAGE
// =====================================================

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file,
    ) => ({

      folder:
        "chat_app_uploads",

      resource_type:

  file.originalname
    .toLowerCase()
    .endsWith(".zip") ||

  file.originalname
    .toLowerCase()
    .endsWith(".rar") ||

  file.originalname
    .toLowerCase()
    .endsWith(".7z")

    ? "raw"

    : "auto",
    
      public_id:
      `${Date.now()}-${file.originalname
        .replace(/\s+/g, "-")
        .replace(/[()]/g, "")}`,

    }),

  });



// =====================================================
// MULTER
// =====================================================

export const upload =
  multer({

    storage,

    limits: {

      fileSize:
        1024 * 1024 * 50,

    },

  });