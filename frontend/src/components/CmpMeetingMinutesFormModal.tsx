import { FormEvent, useState } from "react";
import { CmpMeetingMinutes, CmpMeetingMinutesInput } from "../cmpTypes";

interface Props {
  meeting: CmpMeetingMinutes | null;
  onClose: () => void;
  onSave: (data: Partial<CmpMeetingMinutesInput>) => Promise<void>;
}

const MEETING_TYPE_SUGGESTIONS = [
  "Design Review",
  "Client Meeting",
  "Internal Coordination",
  "Kickoff Meeting",
];

function toDateInputValue(value: string | null): string {
  return value ? value.substring(0, 10) : "";
}

export default function CmpMeetingMinutesFormModal({ meeting, onClose, onSave }: Props) {
  const [meetingDate, setMeetingDate] = useState(
    toDateInputValue(meeting?.meetingDate ?? null) || new Date().toISOString().substring(0, 10)
  );
  const [title, setTitle] = useState(meeting?.title ?? "");
  const [meetingType, setMeetingType] = useState(meeting?.meetingType ?? "");
  const [location, setLocation] = useState(meeting?.location ?? "");
  const [attendees, setAttendees] = useState(meeting?.attendees ?? "");
  const [summary, setSummary] = useState(meeting?.summary ?? "");
  const [nextMeetingDate, setNextMeetingDate] = useState(
    toDateInputValue(meeting?.nextMeetingDate ?? null)
  );
  const [notes, setNotes] = useState(meeting?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim() || null,
        meetingDate: new Date(meetingDate).toISOString(),
        meetingType: meetingType || null,
        location: location || null,
        attendees: attendees || null,
        summary: summary || null,
        nextMeetingDate: nextMeetingDate ? new Date(nextMeetingDate).toISOString() : null,
        notes: notes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save meeting minutes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {meeting ? "Edit Meeting Minutes" : "New Meeting Minutes"}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Meeting Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional — e.g. Concept design sign-off"
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meeting Date
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <input
                list="cmp-meeting-type-suggestions"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                placeholder="e.g. Design Review"
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
              <datalist id="cmp-meeting-type-suggestions">
                {MEETING_TYPE_SUGGESTIONS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Optional"
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Attendees
            </label>
            <input
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Comma-separated names"
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Next Meeting Date
            </label>
            <input
              type="date"
              value={nextMeetingDate}
              onChange={(e) => setNextMeetingDate(e.target.value)}
              className="w-full sm:w-1/2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
