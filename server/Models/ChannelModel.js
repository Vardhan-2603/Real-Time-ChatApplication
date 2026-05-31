import { Schema, model } from "mongoose";

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

export const ChannelModel = model("channel", channelSchema);
