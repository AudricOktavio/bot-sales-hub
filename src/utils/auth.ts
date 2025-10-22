export type AuthHeader = { Authorization?: string };

export const authHeader = (): AuthHeader => {
  const token = localStorage.getItem("access_token");
  const type = localStorage.getItem("token_type") || "Bearer";
  return token ? { Authorization: `${type} ${token}` } : {};
};

export const hasToken = () => !!localStorage.getItem("access_token");

export const clearToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
};
