import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { getIO } from "../sockets";

export async function createList(req: AuthRequest, res: Response) {
  const { boardId, title } = req.body;

  const lastList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
  });

  const list = await prisma.list.create({
    data: { boardId, title, position: lastList ? lastList.position + 1 : 0 },
  });

  getIO().to(boardId).emit("list:created", list);
  res.status(201).json(list);
}

export async function updateList(req: AuthRequest, res: Response) {
  const { title, position } = req.body;
  const list = await prisma.list.update({
    where: { id: req.params.id },
    data: { title, position },
  });

  getIO().to(list.boardId).emit("list:updated", list);
  res.json(list);
}

export async function deleteList(req: AuthRequest, res: Response) {
  const list = await prisma.list.delete({ where: { id: req.params.id } });
  getIO().to(list.boardId).emit("list:deleted", { id: list.id });
  res.status(204).send();
}
