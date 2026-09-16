import { useState } from "react";
import { PortfolioDocument, PortfolioDocumentInput } from "../types";
import { formatDate, formatFileSize } from "../format";
import { portfolioDocumentFileUrl } from "../api";
import PortfolioDocumentUploadModal from "./PortfolioDocumentUploadModal";

interface Props {
  documents: PortfolioDocument[];
  onUpload: (data: Partial<PortfolioDocumentInput> & { file: File }) => Promise<void>;
  onDelete: (document: PortfolioDocument) => Promise<void>;
}

export default function PortfolioDocumentsPanel({ documents, onUpload, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);

  async function handleSave(data: Partial<PortfolioDocumentInput> & { file: File }) {
    await onUpload(data);
    setShowModal(false);
  }

  async function handleDelete(document: PortfolioDocument) {
    if (!confirm(`Delete "${document.title}"? This cannot be undone.`)) return;
    await onDelete(document);
  }

  const sorted = [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Portfolio Documents
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Files that span multiple projects — all-project catch-up minutes, policies, templates.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 shrink-0"
        >
          + Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No portfolio documents uploaded yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {sorted.map((doc) => (
            <li key={doc.id} className="py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={portfolioDocumentFileUrl(doc.id)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    {doc.title}
                  </a>
                  {doc.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {doc.category}
                    </span>
                  )}
                </div>
                {doc.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {doc.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 dark:text-slate-500">
                  <span>{doc.originalFilename}</span>
                  <span>· {formatFileSize(doc.fileSize)}</span>
                  <span>· {formatDate(doc.createdAt)}</span>
                  <span>· {doc.uploadedByName}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc)}
                className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <PortfolioDocumentUploadModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
