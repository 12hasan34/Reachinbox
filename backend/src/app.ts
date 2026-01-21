/// <reference path="./types/express.d.ts" />
import express from "express";
import emailRoutes from "./routes/email.routes";
import authRoutes from "./routes/auth.routes";
import { requireAuth } from "./middleware/requireAuth";
import { env } from "./config/env";

export const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", env.CORS_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use("/auth", authRoutes);
app.use("/emails", requireAuth, emailRoutes);