export type AuthHeader = { Authorization?: string };

export const authHeader = (): AuthHeader => {
  const token = localStorage.getItem("access_token");
  const type = localStorage.getItem("token_type") || "Bearer";
  return token ? { Authorization: `${type} ${token}` } : {};
};

export const getTenantIdFromJwt = (token: string | null): number | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    const candidate =
      payload?.tenant_id ??
      payload?.tenantId ??
      payload?.tenant ??
      payload?.tid ??
      payload?.sub ??
      payload?.tenant_name ??
      payload?.tenantName;
    if (candidate === undefined || candidate === null) return null;
    const str = String(candidate);
    const directNum = Number(str);
    if (Number.isFinite(directNum)) return directNum;
    // Fallback: extract first integer substring (e.g., "tenant:3")
    const match = str.match(/(\d+)/);
    if (match && Number.isFinite(Number(match[1]))) {
      return Number(match[1]);
    }
    return null;
  } catch (err) {
    console.error("Failed to parse tenant id from token", err);
    return null;
  }
};

export const hasToken = () => !!localStorage.getItem("access_token");

export const clearToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
};
