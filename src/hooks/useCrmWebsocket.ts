import { useEffect, useMemo, useRef, useState } from "react";
import { API_CONFIG } from "@/config/api";

/**
 * Shared WebSocket for the whole app (singleton per browser tab).
 *
 * ✅ Features:
 * - Prevents multiple WS connections
 * - Reconnect with exponential backoff
 * - Heartbeat ping
 * - Proper BASE_URL resolution:
 *    - VITE_API_BASE=/api  -> uses window.location.origin + /api
 *    - VITE_API_BASE=http://localhost:8000 -> uses directly
 * - Stops reconnect loop when auth/session is invalid
 *   (backend 403 usually appears as browser close code 1006)
 * - Adds onclose monitoring logs
 */

type Listener = (payload: any) => void;
type ConnListener = (connected: boolean) => void;

type SharedState = {
  socket: WebSocket | null;
  connected: boolean;
  connecting: boolean;

  reconnectAttempt: number;
  reconnectTimer: number | null;
  heartbeatTimer: number | null;

  listeners: Set<Listener>;
  connListeners: Set<ConnListener>;
  refCount: number;

  lastSubscribedPhone: string | null;
  debug: boolean;

  // ✅ stop infinite reconnect on auth reject
  hardStopReconnect: boolean;
  fastFailCount: number;
  lastOpenAt: number | null;
};

const shared: SharedState = {
  socket: null,
  connected: false,
  connecting: false,

  reconnectAttempt: 0,
  reconnectTimer: null,
  heartbeatTimer: null,

  listeners: new Set(),
  connListeners: new Set(),
  refCount: 0,

  lastSubscribedPhone: null,
  debug: false,

  hardStopReconnect: false,
  fastFailCount: 0,
  lastOpenAt: null,
};

const log = (...args: any[]) => {
  if (shared.debug) console.log("[useCrmWebsocket]", ...args);
};

const safeJson = (s: string) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const notifyConnected = (connected: boolean) => {
  shared.connected = connected;
  for (const cb of shared.connListeners) cb(connected);
};

const notifyPayload = (payload: any) => {
  for (const cb of shared.listeners) cb(payload);
};

const clearTimers = () => {
  if (shared.reconnectTimer) {
    window.clearTimeout(shared.reconnectTimer);
    shared.reconnectTimer = null;
  }
  if (shared.heartbeatTimer) {
    window.clearInterval(shared.heartbeatTimer);
    shared.heartbeatTimer = null;
  }
};

const startHeartbeat = () => {
  if (shared.heartbeatTimer) window.clearInterval(shared.heartbeatTimer);

  shared.heartbeatTimer = window.setInterval(() => {
    if (!shared.socket || shared.socket.readyState !== WebSocket.OPEN) return;
    try {
      shared.socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
    } catch {
      // ignore
    }
  }, 25000);
};

const closeSocket = () => {
  clearTimers();

  if (shared.socket) {
    try {
      shared.socket.close();
    } catch {
      // ignore
    }
  }

  shared.socket = null;
  shared.connecting = false;
  notifyConnected(false);
};

const scheduleReconnect = (ensure: () => void) => {
  if (shared.hardStopReconnect) {
    log("hardStopReconnect=true -> stop reconnect");
    return;
  }

  // exponential backoff: 0.5s, 1s, 2s, 4s... max 15s
  const attempt = Math.min(6, shared.reconnectAttempt + 1);
  shared.reconnectAttempt = attempt;

  const delay = Math.min(15000, 500 * Math.pow(2, attempt));
  log("scheduleReconnect", { attempt, delay });

  if (shared.reconnectTimer) window.clearTimeout(shared.reconnectTimer);
  shared.reconnectTimer = window.setTimeout(() => ensure(), delay);
};

/**
 * ✅ BASE_URL can be:
 * - "http://localhost:8000"
 * - "https://ai.rcelectronic.co.id/api"
 * - "/api"
 *
 * For "/api", browser must connect to:
 * - http(s)://current-domain/api
 */
const resolveHttpBaseUrl = (baseUrl: string): string => {
  const b = (baseUrl || "").trim();
  if (!b) return "";

  // already absolute
  if (b.startsWith("http://") || b.startsWith("https://")) return b;

  // relative base like "/api"
  if (b.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${b}`;
    }
    return b;
  }

  // fallback (rare)
  return b;
};

const httpToWsUrl = (url: string) => {
  if (url.startsWith("https://")) return url.replace("https://", "wss://");
  if (url.startsWith("http://")) return url.replace("http://", "ws://");
  return url;
};

const joinUrl = (base: string, path: string) => {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

const ensureSocket = (opts?: { debug?: boolean }) => {
  if (typeof opts?.debug === "boolean") shared.debug = opts.debug;

  // if nobody uses it, don't connect
  if (shared.refCount <= 0) return;

  // hard stop (auth failure)
  if (shared.hardStopReconnect) return;

  // already open/connecting
  if (
    shared.socket &&
    (shared.socket.readyState === WebSocket.OPEN ||
      shared.socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const token = localStorage.getItem("access_token") ?? "";
  if (!token) {
    log("No access_token -> skip WS connect");
    return;
  }

  // ✅ Resolve BASE_URL to absolute http(s)
  const httpBaseAbs = resolveHttpBaseUrl(API_CONFIG.BASE_URL);

  // Convert http(s) -> ws(s)
  const wsBaseAbs = httpToWsUrl(httpBaseAbs);

  // ✅ Websocket endpoint
  // Backend route is "/ws"
  // If API_BASE is "/api" => WS should be "/api/ws"
  // If API_BASE is "http://localhost:8000" => WS should be "/ws"
  const wsPath = API_CONFIG.ENDPOINTS.WEBSOCKET; // "/ws"
  const wsFull = joinUrl(wsBaseAbs, wsPath);

  const wsUrl = `${wsFull}?token=${encodeURIComponent(token)}`;

  // cleanup any existing socket
  closeSocket();

  shared.connecting = true;
  shared.lastOpenAt = Date.now();

  log("connecting:", wsUrl);

  const socket = new WebSocket(wsUrl);
  shared.socket = socket;

  socket.onopen = () => {
    shared.connecting = false;
    shared.reconnectAttempt = 0;
    shared.fastFailCount = 0;

    notifyConnected(true);
    log("connected");

    startHeartbeat();

    // re-subscribe after reconnect
    if (shared.lastSubscribedPhone !== null) {
      try {
        socket.send(
          JSON.stringify({
            type: "subscribe_chat",
            phone_number: shared.lastSubscribedPhone,
          }),
        );
        log("re-subscribed:", shared.lastSubscribedPhone);
      } catch {
        // ignore
      }
    }
  };

  // ✅ monitoring per your request
  socket.onclose = (e) => {
    console.log("WS closed:", e.code, e.reason);
    log("closed", { code: e.code, reason: e.reason });

    shared.connecting = false;
    notifyConnected(false);

    // stop if nobody uses it
    if (shared.refCount <= 0) {
      closeSocket();
      return;
    }

    // ✅ detect "fast reject" (403 handshake rejection often appears as 1006)
    const now = Date.now();
    const openAt = shared.lastOpenAt ?? now;
    const aliveMs = now - openAt;

    const closedTooFast = aliveMs < 2000;
    if (closedTooFast) {
      shared.fastFailCount += 1;
      log("fastFailCount++", { fastFailCount: shared.fastFailCount, aliveMs });
    } else {
      shared.fastFailCount = 0;
    }

    // ✅ if fast fail 3 times -> stop reconnect spam
    if (shared.fastFailCount >= 3) {
      shared.hardStopReconnect = true;

      log("WS likely rejected (403/handshake fail). Stop reconnect loop.");

      // Notify UI (optional)
      window.dispatchEvent(new CustomEvent("crm:ws_failed"));

      closeSocket();
      return;
    }

    scheduleReconnect(() => ensureSocket(opts));
  };

  socket.onerror = () => {
    log("error -> closing");
    try {
      socket.close();
    } catch {
      // ignore
    }
  };

  socket.onmessage = (evt) => {
    const raw = String(evt.data ?? "");
    const j = safeJson(raw);
    if (!j) return;
    notifyPayload(j);
  };
};

const sendJson = (payload: any) => {
  if (!shared.socket || shared.socket.readyState !== WebSocket.OPEN)
    return false;

  try {
    shared.socket.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

export type UseCrmWebsocketReturn = {
  connected: boolean;
  send: (payload: any) => boolean;
  subscribeChat: (phoneNumber: string | null) => boolean;
  sendAgentMessage: (phoneNumber: string, text: string, whatsappId?: string | null) => boolean;

  // ✅ allow manual restart after login
  resetWs: () => void;
};

export function useCrmWebsocket(options?: {
  debug?: boolean;
  onMessage?: (payload: any) => void;
}): UseCrmWebsocketReturn {
  const [connected, setConnected] = useState<boolean>(shared.connected);

  const onMessageRef = useRef<Listener | null>(null);
  if (options?.onMessage) onMessageRef.current = options.onMessage;

  const api = useMemo<UseCrmWebsocketReturn>(() => {
    return {
      connected,

      send: (payload: any) => sendJson(payload),

      subscribeChat: (phoneNumber: string | null) => {
        shared.lastSubscribedPhone = phoneNumber;
        return sendJson({ type: "subscribe_chat", phone_number: phoneNumber });
      },

      sendAgentMessage: (phoneNumber: string, text: string, whatsappId?: string | null) => {
        return sendJson({
          type: "send",
          phone_number: phoneNumber,
          text,
          role: "agent",
          send_to_whatsapp: true,
          whatsapp_id: whatsappId ?? null,
        });
      },

      resetWs: () => {
        shared.hardStopReconnect = false;
        shared.fastFailCount = 0;
        shared.reconnectAttempt = 0;
        ensureSocket({ debug: options?.debug });
      },
    };
  }, [connected, options?.debug]);

  useEffect(() => {
    shared.refCount += 1;

    const connCb: ConnListener = (c) => setConnected(c);
    shared.connListeners.add(connCb);

    const msgCb: Listener = (payload) => {
      if (onMessageRef.current) onMessageRef.current(payload);
    };
    shared.listeners.add(msgCb);

    ensureSocket({ debug: options?.debug });

    return () => {
      shared.listeners.delete(msgCb);
      shared.connListeners.delete(connCb);
      shared.refCount -= 1;

      if (shared.refCount <= 0) {
        window.setTimeout(() => {
          if (shared.refCount <= 0) closeSocket();
        }, 1500);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return api;
}
