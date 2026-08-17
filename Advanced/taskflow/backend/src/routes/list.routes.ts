import { Router } from "express";
import { createList, updateList, deleteList } from "../controllers/list.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.post("/", createList);
router.patch("/:id", updateList);
router.delete("/:id", deleteList);

export default router;
