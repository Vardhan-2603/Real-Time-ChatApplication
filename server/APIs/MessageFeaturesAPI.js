import express from "express";

import {
  editMessage,
  sendThreadReply,
  getThreadReplies,
  markMessagesAsSeen,
  reactToMessage,
} from "../controllers/messageFeatures.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";
export const messageFeaturesRoute = express.Router();

/* ======================================================
   EDIT MESSAGE
====================================================== */

messageFeaturesRoute.put("/edit/:messageId", verifyToken, editMessage);

/* ======================================================
   SEND THREAD REPLY
====================================================== */

messageFeaturesRoute.post(
  "/thread-reply/:parentMessageId",
  verifyToken,
  sendThreadReply,
);

/* ======================================================
   GET THREAD REPLIES
====================================================== */

messageFeaturesRoute.get(
  "/thread-replies/:parentMessageId",
  verifyToken,
  getThreadReplies,
);

/* ======================================================
   MARK MESSAGES AS SEEN
====================================================== */

messageFeaturesRoute.post("/mark-seen", verifyToken, markMessagesAsSeen);

/* ======================================================
   REACT TO MESSAGE  ← THIS WAS MISSING
====================================================== */

messageFeaturesRoute.post("/react/:messageId", verifyToken, reactToMessage);
