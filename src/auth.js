import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "./config.js";

export function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '3 days' });
}

export function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw StatusCodes.UNAUTHORIZED;
  }
  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.decoded = data;
    next();
  });
}