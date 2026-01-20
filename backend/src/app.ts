import cors from "cors";
import express from "express";
import emailRoutes from "./routes/email.routes";

const app = express();

app.use(cors()); // ✅ THIS FIXES FAILED FETCH
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/emails", emailRoutes);

export default app;
