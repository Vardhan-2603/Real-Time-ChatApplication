import express from "express";

import {
  sendMessage,
} from "../controllers/message.controller.js";

import {
  editMessage,
  sendThreadReply,
  getThreadReplies,
  reactToMessage,
} from "../controllers/messageFeatures.controller.js";

import {
  verifyToken,
} from "../middleware/verifyToken.js";


import {
  upload,
} from "../middleware/upload.middleware.js";

const router = express.Router();

/* ======================================================
   NORMAL MESSAGE
====================================================== */

router.post(
  "/send",
  upload.single("file"),
  sendMessage,
);

/* ======================================================
   EDIT MESSAGE
====================================================== */

router.put(
  "/edit/:messageId",
  verifyToken,
  editMessage,
);

/* ======================================================
   THREAD REPLY
====================================================== */

router.post(
  "/thread-reply/:parentMessageId",
  verifyToken,
  sendThreadReply,
);

/* ======================================================
   GET THREAD REPLIES
====================================================== */

router.get(
  "/thread-replies/:parentMessageId",
  verifyToken,
  getThreadReplies,
);

/* ======================================================
   REACT TO MESSAGE
====================================================== */

router.post(
  "/react/:messageId",
  verifyToken,
  reactToMessage,
);

export default router;
