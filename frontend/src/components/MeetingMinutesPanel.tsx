import { useState } from "react";
import { MeetingMinutes, MeetingMinutesInput } from "../types";
import { formatDate } from "../format";
import MeetingMinutesFormModal from "./MeetingMinutesFormModal";

interface Props {
  meetings: MeetingMinutes[];
  onCreate: (data: Partial<MeetingMinutesInput>) => Promise<void>;
  onUpdate: (meeting: MeetingMinutes, data: Partial<MeetingMinutesInput>) => Promise<void>;
  onDelete: (meeting: MeetingMinutes) => Promise<void>;
}

export default function MeetingMinutesPanel({
  meetings,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MeetingMinutes | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(meeting: MeetingMinutes) {
    setEditing(meeting);
    setShowModal(true);
  }

  async function handleSave(data: Partial<MeetingMinutesInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(meeting: MeetingMinutes) {
    if (!confirm("Delete these meeting minutes? This cannot be undone.")) return;
    await onDelete(meeting);
  }

  const sorted = [...meetings].sort(
    (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Meeting Minutes
          </h2>
          {meetings.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {meetings.length} recorded
            </span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Meeting
        </button>
      </div>

      {meetings.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No meeting minutes recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {sorted.map((meeting) => {
            const isExpanded = expandedId === meeting.id;
            return (
              <li key={meeting.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatDate(meeting.meetingDate)}
                      </span>
                      {meeting.meetingType && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          {meeting.meetingType}
                        </span>
                      )}
                      {meeting.location && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {meeting.location}
                        </span>
                      )}
                    </div>
                    {meeting.summary && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {meeting.summary}
                      </p>
                    )}
                  </button>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <button
                      onClick={() => openEdit(meeting)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meeting)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                    {meeting.attendees && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Attendees
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{meeting.attendees}</p>
                      </div>
                    )}
                    {meeting.summary && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Summary
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {meeting.summary}
                        </p>
                      </div>
                    )}
                    {meeting.notes && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Notes
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {meeting.notes}
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Recorded by {meeting.recordedByName}
                      {meeting.nextMeetingDate &&
                        ` · Next meeting ${formatDate(meeting.nextMeetingDate)}`}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <MeetingMinutesFormModal
          meeting={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
