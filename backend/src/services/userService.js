import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";

export async function createUser({ email, password, displayName }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({
    email: email.toLowerCase().trim(),
    passwordHash,
    displayName: (displayName || "").trim() || email.split("@")[0],
  });
}

export async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(id) {
  return User.findById(id).lean();
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

export function toPublicUser(doc) {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : doc;
  const id = u._id != null ? String(u._id) : String(u.id);
  return {
    id,
    email: u.email,
    displayName: u.displayName || u.email,
  };
}

export async function getUserSummariesByIds(ids) {
  if (!ids.length) return [];
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!objectIds.length) return ids.map((id) => ({ id, label: id }));
  const docs = await User.find({ _id: { $in: objectIds } })
    .select("displayName email")
    .lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  return ids.map((id) => {
    const d = byId.get(id);
    return { id, label: d?.displayName || d?.email || id };
  });
}
