import type { RequestHandler } from "express";
import Redis from "ioredis";
import { redisConnection } from "../config/connection";

const redis = new Redis(redisConnection);

export const requireAuth: RequestHandler = async (req, res, next) => {
  const auth = req.header("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = match[1];
  const email = await redis.get(`session:${token}`);

  if (!email) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = { email };
  return next();
};
