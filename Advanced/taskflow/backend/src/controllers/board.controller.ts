import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";

export async function getBoards(req: AuthRequest, res: Response) {
  const boards = await prisma.board.findMany({
    where: { members: { some: { userId: req.user!.userId } } },
    include: {
      _count: { select: { lists: true } },
      members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json(boards);
}

export async function createBoard(req: AuthRequest, res: Response) {
  const { title, description, colorTheme } = req.body;

  const board = await prisma.board.create({
    data: {
      title,
      description,
      colorTheme: colorTheme || "#6366f1",
      members: {
        create: { userId: req.user!.userId, role: "OWNER" },
      },
      lists: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 },
        ],
      },
    },
    include: { lists: true },
  });

  res.status(201).json(board);
}

export async function getBoardById(req: AuthRequest, res: Response) {
  const board = await prisma.board.findFirst({
    where: {
      id: req.params.id,
      members: { some: { userId: req.user!.userId } },
    },
    include: {
      lists: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
          },
        },
      },
      members: { include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } } },
    },
  });

  if (!board) return res.status(404).json({ message: "Board not found" });
  res.json(board);
}

export async function getBoardAnalytics(req: AuthRequest, res: Response) {
  const boardId = req.params.id;

  const lists = await prisma.list.findMany({
    where: { boardId },
    include: { cards: true },
  });

  const cardsByList = lists.map((l) => ({ list: l.title, count: l.cards.length }));

  const allCards = lists.flatMap((l) => l.cards);
  const priorityBreakdown = ["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => ({
    priority: p,
    count: allCards.filter((c) => c.priority === p).length,
  }));

  const overdue = allCards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date()).length;

  res.json({
    totalCards: allCards.length,
    cardsByList,
    priorityBreakdown,
    overdue,
  });
}

export async function addMember(req: AuthRequest, res: Response) {
  const boardId = req.params.id;
  const { email, role } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const member = await prisma.boardMember.create({
    data: { boardId, userId: user.id, role: role || "MEMBER" },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  res.status(201).json(member);
}
