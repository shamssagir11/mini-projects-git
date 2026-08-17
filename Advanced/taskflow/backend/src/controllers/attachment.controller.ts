import { Response } from "express";
import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "../config/db";
import { s3, S3_BUCKET, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../config/s3";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

/**
 * STEP 1 — Client asks the backend for a presigned PUT url.
 * The backend never touches the file bytes: the browser uploads directly to S3.
 * This keeps large uploads off our server and keeps AWS credentials server-side only.
 */
export async function getUploadUrl(req: AuthRequest, res: Response) {
  const { cardId, fileName, fileType, fileSize } = req.body;

  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
    throw new AppError("File type not allowed", 400);
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new AppError("File exceeds 10MB limit", 400);
  }

  // Confirm the requester actually belongs to the board this card lives on
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { include: { board: { include: { members: true } } } } },
  });
  if (!card) throw new AppError("Card not found", 404);

  const isMember = card.list.board.members.some((m) => m.userId === req.user!.userId);
  if (!isMember) throw new AppError("Not authorized for this board", 403);

  // Namespaced, random key — never trust the client-supplied filename as the S3 key.
  // This prevents path traversal and key-collision/overwrite attacks.
  const s3Key = `boards/${card.list.boardId}/cards/${cardId}/${randomUUID()}-${sanitizeFileName(fileName)}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: fileType,
    ContentLength: fileSize,
    ServerSideEncryption: "AES256",
    // Metadata for auditability
    Metadata: { "uploaded-by": req.user!.userId },
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60s to start the upload

  res.json({ uploadUrl, s3Key });
}

/**
 * STEP 2 — After the browser successfully PUTs the file to S3, it confirms
 * completion here so we persist the attachment record.
 */
export async function confirmUpload(req: AuthRequest, res: Response) {
  const { cardId, s3Key, fileName, fileType, fileSize } = req.body;

  const attachment = await prisma.attachment.create({
    data: {
      cardId,
      s3Key,
      fileName: sanitizeFileName(fileName),
      fileType,
      fileSize,
      uploadedById: req.user!.userId,
    },
  });

  res.status(201).json(attachment);
}

/**
 * Generate a short-lived GET url whenever the client wants to view/download
 * a file. Nothing is ever served directly from our API or made public on S3.
 */
export async function getDownloadUrl(req: AuthRequest, res: Response) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: req.params.id },
    include: { card: { include: { list: { include: { board: { include: { members: true } } } } } } },
  });
  if (!attachment) throw new AppError("Attachment not found", 404);

  const isMember = attachment.card.list.board.members.some((m) => m.userId === req.user!.userId);
  if (!isMember) throw new AppError("Not authorized", 403);

  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: attachment.s3Key });
  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  res.json({ downloadUrl, fileName: attachment.fileName });
}

export async function deleteAttachment(req: AuthRequest, res: Response) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: req.params.id },
    include: { card: { include: { list: { include: { board: { include: { members: true } } } } } } },
  });
  if (!attachment) throw new AppError("Attachment not found", 404);

  const membership = attachment.card.list.board.members.find((m) => m.userId === req.user!.userId);
  const canDelete =
    membership && (attachment.uploadedById === req.user!.userId || ["OWNER", "ADMIN"].includes(membership.role));
  if (!canDelete) throw new AppError("Not authorized to delete this file", 403);

  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: attachment.s3Key }));
  await prisma.attachment.delete({ where: { id: attachment.id } });

  res.status(204).send();
}

// Strips path separators and control characters so the name is safe to store/display
function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 200);
}
