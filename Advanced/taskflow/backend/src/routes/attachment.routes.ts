import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getUploadUrl, confirmUpload, getDownloadUrl, deleteAttachment } from "../controllers/attachment.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// Limit presign requests to prevent abuse of the upload flow
const presignLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.post("/upload-url", presignLimiter, getUploadUrl);
router.post("/confirm", confirmUpload);
router.get("/:id/download-url", getDownloadUrl);
router.delete("/:id", deleteAttachment);

export default router;
