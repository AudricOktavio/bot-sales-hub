// In prod your Dockerfile sets VITE_API_BASE=/api; in dev we default to http://localhost:8000
const RAW_API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.toString().trim() ||
  "http://localhost:8000";

// Ensure no trailing slash so concatenation is clean
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

type EndpointFn = (...args: any[]) => string;

export const API_CONFIG = {
  BASE_URL: API_BASE,
  ENDPOINTS: {
    REGISTER: "/register",
    TOKEN: "/token",

    AGENTS: "/agents",
    AGENT_BY_ID: (id: number) => `/agents/${id}`,
    AGENT_CHAT: (id: number) => `/agents/${id}`,

    PRODUCTS: "/products",
    PRODUCTS_CREATE: "/products",
    PRODUCT_BY_ID: (id: number) => `/products/${id}`,

    SAP_PROVIDER: "/sap/provider",

    WHATSAPPS: "/whatsapps",
    WHATSAPP_BY_ID: (id: number) => `/whatsapps/${id}`,

    PAYMENT_PROVIDER: "/payment/provider",

    ODOO_PROVIDER: "/odoo/provider",
    ODOO_TEST: "/odoo/provider/test",
    ODOO_SYNC_PRODUCTS: "/odoo/sync-products",

    ORDERS: "/orders",
    ORDER_BY_ID: (id: number) => `/orders/${id}`,

    ORDER_DETAILS: "/order-details",
    ORDER_DETAIL_BY_ID: (id: number) => `/order-details/${id}`,

    CONTACTS: "/contacts",
    CONTACTS_CREATE: "/contacts",
    CONTACT_BY_ID: (id: number) => `/contacts/${id}`,

    CHAT_LOGS: "/chat_logs",
    CHAT_LOG_BY_PHONE: (phone_number: string, last_chat_id: number) =>
      `/chat_logs/${encodeURIComponent(
        phone_number
      )}?last_chat_id=${last_chat_id}`,

    // Handoff controls
    HANDOFF_TOGGLE: (contact_id: number) => `/contacts/${contact_id}/handoff`, // use PATCH with body {active:boolean}
    HANDOFF_RESOLVE: (contact_id: number) => `/contacts/${contact_id}/resolve`, // use POST (no body)

    WEBSOCKET: "/ws",
  },
} as const;

// Helper: works for both string endpoints and function endpoints
type Endpoints = typeof API_CONFIG.ENDPOINTS;
export function getApiUrl<K extends keyof Endpoints>(
  key: K,
  ...args: Endpoints[K] extends EndpointFn ? Parameters<Endpoints[K]> : []
): string {
  const ep = API_CONFIG.ENDPOINTS[key] as unknown as string | EndpointFn;
  const path = typeof ep === "function" ? ep(...(args as any)) : ep;
  // Join without creating double slashes
  return `${API_CONFIG.BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
