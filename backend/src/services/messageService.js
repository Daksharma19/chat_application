import { Message } from "../models/Message.js";

export async function createMessage({ senderId, receiverId, content, timestamp, delivered }) {
  return Message.create({ senderId, receiverId, content, timestamp, delivered });
}

export async function findUndeliveredForUser(receiverId) {
  return Message.find({ receiverId, delivered: false }).sort({ timestamp: 1 }).lean();
}


export async function markDelivered(messageId) {
  return Message.updateOne({ _id: messageId }, { $set: { delivered: true } });
}
