import { Router } from "express";
import {
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  addComment,
} from "../controllers/card.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.post("/", createCard);
router.patch("/:id", updateCard);
router.patch("/:id/move", moveCard);
router.delete("/:id", deleteCard);
router.post("/:id/comments", addComment);

export default router;
