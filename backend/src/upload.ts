import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, "../uploads");

// Drawings, contracts, correspondence — the file types an APD project
// actually accumulates. Extension is trusted only from this allowlist;
// the on-disk filename itself is always a fresh random UUID, never the
// client-supplied name, so a crafted filename can't escape the upload dir
// or overwrite another file.
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".txt",
  ".csv",
  ".dwg",
  ".zip",
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function projectUploadDir(projectId: string): string {
  return path.join(UPLOAD_DIR, projectId);
}

export function attachmentFilePath(projectId: string, storedFilename: string): string {
  return path.join(projectUploadDir(projectId), storedFilename);
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = projectUploadDir(req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ALLOWED_EXTENSIONS.has(ext) ? ext : ""}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`File type "${ext || "unknown"}" is not allowed`));
      return;
    }
    cb(null, true);
  },
});
