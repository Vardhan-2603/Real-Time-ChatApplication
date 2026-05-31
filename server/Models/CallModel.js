import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    type: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },

    status: {
      type: String,
      enum: ["calling", "answered", "rejected", "missed", "ended"],
      default: "calling",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: Date,

    duration: Number,
  },
  {
    timestamps: true,
  },
);

export const CallModel = mongoose.model("calls", callSchema);
