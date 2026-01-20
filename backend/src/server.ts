import http from "http";
import app from "./app";
import { env } from "./config/env";

const PORT = Number(env.PORT) || 4000;

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

// ✅ KEEP PROCESS ALIVE (Windows safety)
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});
