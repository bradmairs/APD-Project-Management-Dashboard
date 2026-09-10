import { useLocation, useNavigate } from "react-router-dom";
import { useOrganizations } from "../auth/OrgContext";

// Hidden entirely for the (currently common) case of a user with access to
// only one organization — there's nothing to switch between, so a visible
// control would just be clutter, matching how e.g. CashFlowPanel hides its
// Approved Variations stat when there's nothing to show.
export default function OrgSwitcher() {
  const { organizations, loading } = useOrganizations();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading || organizations.length < 2) return null;

  const activeSlug = location.pathname.startsWith("/cmp") ? "cmp" : "gvw";

  function handleChange(slug: string) {
    navigate(slug === "cmp" ? "/cmp" : "/");
  }

  return (
    <select
      value={activeSlug}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Switch organization"
      className="rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 py-1.5 text-sm"
    >
      {organizations.map((org) => (
        <option key={org.slug} value={org.slug}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
