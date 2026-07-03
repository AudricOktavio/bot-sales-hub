import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "@/lib/api";
import { API_CONFIG } from "@/config/api";
import { hasToken } from "@/utils/auth";

export interface Organization {
  id: number;
  name: string;
  owner_tenant_id: number;
  permission: string; // "owner" | "admin" | "member" | ...
}

interface OrgContextValue {
  organizations: Organization[];
  selectedOrg: Organization | null;
  permission: string; // "owner" for personal mode
  loading: boolean;
  needsSelection: boolean;
  selectOrganization: (org: Organization) => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = "selected_organization";

const OrganizationContext = createContext<OrgContextValue | undefined>(
  undefined,
);

function readStored(): Organization | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Organization) : null;
  } catch {
    return null;
  }
}

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(
    readStored,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    if (!hasToken()) return;
    setLoading(true);
    try {
      const res = await api.get<Organization[]>(
        API_CONFIG.ENDPOINTS.ORGANIZATIONS_ME,
      );
      const list = Array.isArray(res.data) ? res.data : [];
      setOrganizations(list);
      // Re-sync stored selection against latest data
      setSelectedOrg((prev) => {
        if (!prev) return prev;
        const match = list.find((o) => o.id === prev.id);
        if (match) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
          return match;
        }
        // Stored org no longer available
        localStorage.removeItem(STORAGE_KEY);
        return null;
      });
      setFetched(true);
    } catch (err) {
      console.error("Failed to load organizations", err);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasToken()) void refresh();
  }, [refresh]);

  const selectOrganization = useCallback((org: Organization) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(org));
    setSelectedOrg(org);
  }, []);

  const clearSelection = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedOrg(null);
  }, []);

  const needsSelection =
    fetched && organizations.length > 0 && selectedOrg === null;

  const permission = selectedOrg?.permission ?? "owner";

  const value = useMemo<OrgContextValue>(
    () => ({
      organizations,
      selectedOrg,
      permission,
      loading,
      needsSelection,
      selectOrganization,
      clearSelection,
      refresh,
    }),
    [
      organizations,
      selectedOrg,
      permission,
      loading,
      needsSelection,
      selectOrganization,
      clearSelection,
      refresh,
    ],
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export function useOrganization(): OrgContextValue {
  const ctx = useContext(OrganizationContext);
  if (!ctx)
    throw new Error(
      "useOrganization must be used within OrganizationProvider",
    );
  return ctx;
}

// Helper for non-React modules (axios interceptor) to read the current selection.
export function getSelectedOrganizationId(): number | null {
  const stored = readStored();
  return stored?.id ?? null;
}