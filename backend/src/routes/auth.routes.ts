import { Router } from "express";
import crypto from "crypto";
import Redis from "ioredis";
import { env } from "../config/env";
import { redisConnection } from "../config/connection";

const router = Router();
const redis = new Redis(redisConnection);

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAuthEmail = env.AUTH_EMAIL.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const normalizedAuthPassword = env.AUTH_PASSWORD.trim();

  const okEmail = safeEqual(normalizedEmail, normalizedAuthEmail);
  const okPassword = safeEqual(normalizedPassword, normalizedAuthPassword);

  if (!okEmail || !okPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = crypto.randomUUID();
  const key = `session:${token}`;

  await redis.set(key, email, "EX", env.AUTH_TOKEN_TTL_SECONDS);

  return res.json({
    token,
    user: { email }
  });
});

export default router;
