import express from "express";
import emailRoutes from "./routes/email.routes";

export const app = express();

app.use(express.json());

// ✅ HEALTH CHECK
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/emails", emailRoutes);
