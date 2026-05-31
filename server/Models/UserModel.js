import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
    },

    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid username! It must start with an alphabet letter and contain only letters, numbers, and underscores.`,
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid email address! The local part before @ must start with an alphabet letter.`,
      },
    },

    password: {
      type: String,

      required: function () {
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePic: {
      type: String,
    },

    tagLine: {
      type: String,
    },

    // ADDED FIELD
    lastSeen: {
      type: Date,
      default: null,
    },

    notes: [
      {
        text: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    strict: "throw",
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = model("user", userSchema);