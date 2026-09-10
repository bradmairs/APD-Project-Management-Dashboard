import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getMyOrganizations } from "../api";
import { OrganizationMembership } from "../types";
import { useAuth } from "./AuthContext";

interface OrgContextValue {
  organizations: OrganizationMembership[];
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

// Loads once the user is authenticated, so the org switcher (and any
// "which dashboards can I see" check) has data as soon as a page needs it —
// mirrors AuthContext's own load-on-mount pattern.
export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyOrganizations()
      .then(setOrganizations)
      .catch(() => setOrganizations([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <OrgContext.Provider value={{ organizations, loading }}>{children}</OrgContext.Provider>
  );
}

export function useOrganizations(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrganizations must be used within an OrgProvider");
  return ctx;
}
