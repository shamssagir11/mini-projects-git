import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import boardRoutes from "./routes/board.routes";
import listRoutes from "./routes/list.routes";
import cardRoutes from "./routes/card.routes";
import attachmentRoutes from "./routes/attachment.routes";
import { errorHandler } from "./middleware/errorHandler";
import { initSocket } from "./sockets";

const app = express();
const httpServer = http.createServer(app);

// Security & performance middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

// Basic rate limiting to protect auth endpoints from brute force
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/attachments", attachmentRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Real-time layer
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 TaskFlow API running on port ${PORT}`);
});
