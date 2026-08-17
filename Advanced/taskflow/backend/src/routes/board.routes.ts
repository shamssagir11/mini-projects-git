import { Router } from "express";
import {
  getBoards,
  createBoard,
  getBoardById,
  getBoardAnalytics,
  addMember,
} from "../controllers/board.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", getBoards);
router.post("/", createBoard);
router.get("/:id", getBoardById);
router.get("/:id/analytics", getBoardAnalytics);
router.post("/:id/members", addMember);

export default router;
