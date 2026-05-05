import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true, default: "" },
  },
  { versionKey: false }
);

export const User = mongoose.model("User", userSchema);
