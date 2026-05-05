import jwt from "jsonwebtoken";

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
};

export function signUserToken(userId) {
  return jwt.sign({ sub: userId }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyUserToken(token) {
  return jwt.verify(token, secret());
}
