import { FormEvent, useState } from "react";
import { changePassword } from "../api";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        {success ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Password changed
            </h2>
            <p className="text-sm text-slate-600">
              Your password has been updated.
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Change Password
            </h2>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded p-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">At least 8 characters.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
