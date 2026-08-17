import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";

let io: Server;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });

  // Authenticate socket connections using the JWT access token
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: ${user?.email}`);

    // Client joins a board "room" to receive live updates for that board
    socket.on("board:join", (boardId: string) => {
      socket.join(boardId);
    });

    socket.on("board:leave", (boardId: string) => {
      socket.leave(boardId);
    });

    // Live cursor / presence tracking for collaborative feel
    socket.on("presence:move", ({ boardId, x, y }) => {
      socket.to(boardId).emit("presence:update", {
        userId: user.userId,
        x,
        y,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user?.email}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
