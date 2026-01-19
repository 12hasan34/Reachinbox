import express from "express";
import emailRoutes from "./routes/email.routes";

export const app = express();
app.use(express.json());
app.use("/emails", emailRoutes);