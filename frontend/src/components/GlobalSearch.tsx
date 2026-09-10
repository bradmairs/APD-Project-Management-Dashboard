import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { searchAll } from "../api";
import { SearchResult } from "../types";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

// Self-contained like NotificationBell — no props, fetches on its own as
// the user types. Debounced rather than fired on every keystroke since
// each query fans out across ~10 tables server-side.
export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const thisRequest = ++requestId.current;
    const timer = setTimeout(() => {
      searchAll(trimmed)
        .then((data) => {
          if (requestId.current === thisRequest) {
            setResults(data.results);
            setLoading(false);
          }
        })
        .catch(() => {
          if (requestId.current === thisRequest) {
            setResults([]);
            setLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length >= MIN_QUERY_LENGTH;

  const grouped: { typeLabel: string; items: SearchResult[] }[] = [];
  for (const result of results) {
    const group = grouped.find((g) => g.typeLabel === result.typeLabel);
    if (group) group.items.push(result);
    else grouped.push({ typeLabel: result.typeLabel, items: [result] });
  }

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        placeholder="Search…"
        aria-label="Search across projects and registers"
        className="w-40 sm:w-56 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-1.5 text-sm"
      />

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute left-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-lg z-20 py-1">
            {loading ? (
              <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                No matches for "{trimmed}"
              </p>
            ) : (
              grouped.map((group) => (
                <div key={group.typeLabel}>
                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {group.typeLabel}
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={`/projects/${item.projectId}`}
                      onClick={close}
                      className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <div className="text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.type === "project" ? item.subtitle : item.projectName}
                      </div>
                    </Link>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
