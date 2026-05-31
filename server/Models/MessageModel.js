import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    // =================================================
    // USER REFERENCES
    // =================================================

    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "channel",
    },

    // =================================================
    // THREAD REPLIES
    // =================================================

    parentMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
      default: null,
    },

    // =================================================
    // MESSAGE CONTENT
    // =================================================

    content: {
      type: String,
      default: "",
    },

    // =================================================
    // FILE SUPPORT
    // =================================================

    fileUrl: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "",
    },

    // =================================================
    // MESSAGE TYPE
    // =================================================

    messageType: {
      type: String,
      enum: ["text", "file", "call", "image", "video", "link"],
      default: "text",
    },

    // =================================================
    // CALL LOG SUPPORT
    // =================================================

    callDuration: {
      type: String,
      default: "",
    },

    callStatus: {
      type: String,
      enum: ["", "missed", "rejected", "ended"],
      default: "",
    },

    callType: {
      type: String,
      enum: ["", "audio", "video"],
      default: "",
    },

    // =================================================
    // EDIT SUPPORT
    // =================================================

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // REACTIONS  ← FIXED: was { userId, emoji }, now { emoji, users[] }
    // =================================================

    reactions: {
      type: [
        {
          emoji: { type: String, required: true },
          users: [{ type: Schema.Types.ObjectId, ref: "user" }],
        },
      ],
      default: [],
    },

    // =================================================
    // MESSAGE STATUS
    // =================================================

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // =================================================
    // LINK PREVIEW SUPPORT
    // =================================================

    previewImage:       { type: String, default: "" },
    previewTitle:       { type: String, default: "" },
    previewDescription: { type: String, default: "" },

    clientMessageId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const MessageModel = model("message", messageSchema);
