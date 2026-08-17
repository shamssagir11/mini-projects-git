import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useBoardStore } from "../store/boardStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useSocket(boardId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { addCardLocal, addListLocal, moveCardLocal } = useBoardStore();

  useEffect(() => {
    if (!boardId || !accessToken) return;

    const socket = io(SOCKET_URL, { auth: { token: accessToken } });
    socketRef.current = socket;

    socket.emit("board:join", boardId);

    socket.on("card:created", (card) => addCardLocal(card));
    socket.on("list:created", (list) => addListLocal({ ...list, cards: [] }));
    socket.on("card:moved", ({ cardId, newListId, newPosition }) => {
      // Note: in production, resolve the fromListId from current state before this fires
      moveCardLocal(cardId, newListId, newListId, newPosition);
    });

    return () => {
      socket.emit("board:leave", boardId);
      socket.disconnect();
    };
  }, [boardId, accessToken]);

  return socketRef.current;
}
