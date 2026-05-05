import { signUserToken } from "../utils/jwt.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
  verifyPassword,
} from "../services/userService.js";

function validateAuthBody(body) {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }
  if (password.length < 6) {
    const err = new Error("Password must be at least 6 characters");
    err.status = 400;
    throw err;
  }
  return { email, password };
}

export async function signup(req, res, next) {
  try {
    const { email, password } = validateAuthBody(req.body);
    const displayName =
      typeof req.body.displayName === "string" ? req.body.displayName.trim() : "";

    const existing = await findUserByEmail(email);
    if (existing) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }

    const user = await createUser({ email, password, displayName });
    const token = signUserToken(user._id.toString());
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = validateAuthBody(req.body);
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(user, password))) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    const token = signUserToken(user._id.toString());
    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.auth.userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
}
