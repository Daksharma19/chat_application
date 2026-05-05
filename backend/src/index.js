import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { getAllowedOrigins } from "./config/cors.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initSocket } from "./services/socketService.js";

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat_app";
const allowedOrigins = getAllowedOrigins();

async function main() {
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in environment. Add it to backend/.env");
    process.exit(1);
  }

  await connectDB(MONGODB_URI);

  const app = express();
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());
  app.use("/api", routes);
  app.use(errorHandler);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true, methods: ["GET", "POST"] },
  });

  initSocket(io);

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
