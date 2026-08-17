import { useState } from "react";
import { Paperclip, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios";

interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export default function AttachmentUploader({
  cardId,
  attachments,
  onUploaded,
}: {
  cardId: string;
  attachments: Attachment[];
  onUploaded: (a: Attachment) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      // 1. Ask our backend for a short-lived presigned S3 PUT url (no AWS creds ever reach the browser)
      const { data: presign } = await api.post("/attachments/upload-url", {
        cardId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // 2. Upload the file bytes directly to S3
      const uploadRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("S3 upload failed");

      // 3. Confirm with our backend so it's saved in the database
      const { data: attachment } = await api.post("/attachments/confirm", {
        cardId,
        s3Key: presign.s3Key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      onUploaded(attachment);
      toast.success("File attached");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(id: string, fileName: string) {
    const { data } = await api.get(`/attachments/${id}/download-url`);
    const a = document.createElement("a");
    a.href = data.downloadUrl; // short-lived signed url, expires in 5 min
    a.download = fileName;
    a.click();
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-brand-600 cursor-pointer w-fit">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
        {uploading ? "Uploading..." : "Attach a file"}
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>

      <ul className="space-y-1">
        {attachments.map((a) => (
          <li
            key={a.id}
            onClick={() => handleDownload(a.id, a.fileName)}
            className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <span className="truncate">{a.fileName}</span>
            <span className="text-gray-400">{(a.fileSize / 1024).toFixed(0)} KB</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
