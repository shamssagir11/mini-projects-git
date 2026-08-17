import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { getIO } from "../sockets";

export async function createCard(req: AuthRequest, res: Response) {
  const { listId, title, description, priority, dueDate } = req.body;

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
  });

  const card = await prisma.card.create({
    data: {
      listId,
      title,
      description,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      position: lastCard ? lastCard.position + 1 : 0,
    },
  });

  const list = await prisma.list.findUnique({ where: { id: listId } });
  getIO().to(list!.boardId).emit("card:created", card);

  // Log activity
  await prisma.activityLog.create({
    data: {
      boardId: list!.boardId,
      userId: req.user!.userId,
      action: "CARD_CREATED",
      meta: { cardId: card.id, title: card.title },
    },
  });

  res.status(201).json(card);
}

export async function updateCard(req: AuthRequest, res: Response) {
  const { title, description, priority, dueDate, labels, assigneeId } = req.body;

  const card = await prisma.card.update({
    where: { id: req.params.id },
    data: { title, description, priority, dueDate, labels, assigneeId },
  });

  const list = await prisma.list.findUnique({ where: { id: card.listId } });
  getIO().to(list!.boardId).emit("card:updated", card);
  res.json(card);
}

// Drag-and-drop: move card to a new list/position (real-time sync across all connected clients)
export async function moveCard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { newListId, newPosition } = req.body;

  const card = await prisma.card.update({
    where: { id },
    data: { listId: newListId, position: newPosition },
  });

  const list = await prisma.list.findUnique({ where: { id: newListId } });
  getIO().to(list!.boardId).emit("card:moved", {
    cardId: id,
    newListId,
    newPosition,
    movedBy: req.user!.userId,
  });

  res.json(card);
}

export async function deleteCard(req: AuthRequest, res: Response) {
  const card = await prisma.card.delete({ where: { id: req.params.id } });
  const list = await prisma.list.findUnique({ where: { id: card.listId } });
  getIO().to(list!.boardId).emit("card:deleted", { id: card.id });
  res.status(204).send();
}

export async function addComment(req: AuthRequest, res: Response) {
  const { text } = req.body;
  const comment = await prisma.comment.create({
    data: { cardId: req.params.id, userId: req.user!.userId, text },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const card = await prisma.card.findUnique({
    where: { id: req.params.id },
    include: { list: true },
  });
  getIO().to(card!.list.boardId).emit("comment:created", comment);

  res.status(201).json(comment);
}
