import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    delivered: { type: Boolean, default: false, index: true },
  },
  { versionKey: false }
);

export const Message = mongoose.model("Message", messageSchema);
