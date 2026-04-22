import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Plus,
  Search,
  Send,
  Bot,
  User,
  Handshake,
} from "lucide-react";
import api from "@/lib/api";
import { API_CONFIG } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useCrmWebsocket } from "@/hooks/useCrmWebsocket";

/* ----------------------------- Types ----------------------------- */
type Sender = "customer" | "ai" | "agent";

interface Message {
  id: number;
  sender: Sender;
  content: string;
  timestamp: string;
  recipient?: string; // phone number receiving the message
}

type Status = "new-lead" | "interested" | "closed" | "no-interest";

interface ListRow {
  id: number;
  phoneNumber: string;
  customerName: string;
  date: string;
  status: Status;
  agentName: string;
  customerId?: number;
  handoffActive?: boolean;
  messages: Message[];
}

interface ChatItemWire {
  chat_id: number;
  message: string;
  created_at: string;
  role?: "ai" | "human" | "interrupt" | "agent";
  recipient?: string; // phone number receiving the message
}

interface ApiChatLogWire {
  phone_number: string;
  customer_name: string;
  customer_id?: number;
  is_handoff_active?: boolean;
  log: ChatItemWire[] | ChatItemWire;
}

interface LastChatLogWire {
  chat_list: ApiChatLogWire[];
}

/* ----------------------------- Helpers ----------------------------- */
const getStatusColor = (s: Status) =>
  s === "closed"
    ? "bg-green-500"
    : s === "interested"
    ? "bg-blue-500"
    : s === "new-lead"
    ? "bg-yellow-500"
    : s === "no-interest"
    ? "bg-red-500"
    : "bg-gray-500";

const getStatusText = (s: Status) =>
  s === "closed"
    ? "Closed Won"
    : s === "interested"
    ? "Interested"
    : s === "new-lead"
    ? "New Lead"
    : s === "no-interest"
    ? "No Interest"
    : s;

const extractErr = (e: any) =>
  e?.response?.data?.detail ||
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.message ||
  "Unknown error";

/**
 * IMPORTANT ROLE MAP:
 * - role 'human' => CUSTOMER (incoming from WA)
 * - role 'agent' => HUMAN AGENT (outgoing, should be purple/right)
 * - role 'ai' / 'interrupt' => AI (purple/right)
 */
const mapWireToMessage = (it: ChatItemWire): Message => {
  const role = it.role;

  let sender: Sender = "customer";
  if (role === "ai" || role === "interrupt") sender = "ai";
  else if (role === "agent") sender = "agent";
  else sender = "customer";

  return {
    id: it.chat_id,
    sender,
    content: it.message,
    timestamp: new Date(it.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    recipient: it.recipient,
  };
};

const transformChatLog = (apiChatLog: ApiChatLogWire): ListRow => {
  const logArray = Array.isArray(apiChatLog.log)
    ? apiChatLog.log
    : [apiChatLog.log];
  const messages: Message[] = logArray.filter(Boolean).map(mapWireToMessage);

  return {
    id:
      parseInt(apiChatLog.phone_number.replace(/\D/g, "")) ||
      Math.floor(Math.random() * 1e9),
    phoneNumber: apiChatLog.phone_number,
    customerName: apiChatLog.customer_name || apiChatLog.phone_number,
    date: logArray.length
      ? new Date(logArray[0].created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown",
    status: "new-lead",
    agentName: "Agent",
    handoffActive: apiChatLog.is_handoff_active ?? false,
    customerId: apiChatLog.customer_id,
    messages,
  };
};

/* ----------------------------- Component ----------------------------- */
const ChatDialog = () => {
  const [chatLogs, setChatLogs] = useState<ListRow[]>([]);
  const [selectedChat, setSelectedChat] = useState<ListRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { toast } = useToast();

  const [handoffActive, setHandoffActive] = useState<Record<string, boolean>>(
    {}
  );
  const [filterTab, setFilterTab] = useState<"all" | "assigned" | "unassigned">(
    "assigned"
  );

  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState<Record<string, boolean>>({});

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const selectedPhoneRef = useRef<string | null>(null);
  useEffect(() => {
    selectedPhoneRef.current = selectedChat?.phoneNumber ?? null;
  }, [selectedChat?.phoneNumber]);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    endRef.current?.scrollIntoView({ behavior, block: "nearest" });
  };

  const handleWsPayload = useCallback(
    (payload: any) => {
      const type = payload?.type;

      if (type === "ws_connected") return;

      if (type === "error") {
        toast({
          title: "WebSocket error",
          description: String(payload?.message ?? "Unknown error"),
          variant: "destructive",
        });
        return;
      }

      if (type === "sent") {
        const warning = payload?.warning;
        if (warning) {
          toast({ title: "Message saved", description: String(warning) });
        }
        return;
      }

      // { type:'chat_update', phone_number, data:{...} }
      if (type === "chat_update") {
        const phone = String(
          payload?.phone_number ?? payload?.data?.phone_number ?? ""
        );
        if (!phone) return;

        const data = payload?.data ?? {};
        const logArray: ChatItemWire[] = Array.isArray(data.log)
          ? data.log
          : data.log
          ? [data.log]
          : [];
        const messages = logArray.map(mapWireToMessage);

        // update selected chat
        setSelectedChat((prev) => {
          if (!prev || prev.phoneNumber !== phone) return prev;
          return {
            ...prev,
            customerName: data.customer_name || prev.customerName,
            customerId: data.customer_id ?? prev.customerId,
            handoffActive: Boolean(data.is_handoff_active),
            messages,
          };
        });

        // update list row
        setChatLogs((prev) => {
          const idx = prev.findIndex((r) => r.phoneNumber === phone);
          const updatedRow: ListRow =
            idx === -1
              ? {
                  id:
                    parseInt(phone.replace(/\D/g, "")) ||
                    Math.floor(Math.random() * 1e9),
                  phoneNumber: phone,
                  customerName: data.customer_name || phone,
                  date: messages.length
                    ? new Date(logArray[0].created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "Unknown",
                  status: "new-lead",
                  agentName: "Agent",
                  customerId: data.customer_id,
                  handoffActive: Boolean(data.is_handoff_active),
                  messages,
                }
              : {
                  ...prev[idx],
                  customerName: data.customer_name || prev[idx].customerName,
                  customerId: data.customer_id ?? prev[idx].customerId,
                  handoffActive: Boolean(data.is_handoff_active),
                  messages,
                };

          if (idx === -1) return [updatedRow, ...prev];

          const copy = [...prev];
          copy[idx] = updatedRow;
          return copy;
        });

        setHandoffActive((p) => ({
          ...p,
          [phone]: Boolean(data.is_handoff_active),
        }));

        requestAnimationFrame(() => {
          if (selectedPhoneRef.current === phone) scrollToBottom("auto");
        });

        return;
      }

      // { type:'chat_list_update', data:{ chat_list:[...] } }
      if (type === "chat_list_update") {
        const list = payload?.data?.chat_list;
        if (!Array.isArray(list)) return;

        const rows = list.map(transformChatLog);
        setChatLogs(rows);

        const map: Record<string, boolean> = {};
        list.forEach(
          (c: any) => (map[c.phone_number] = Boolean(c.is_handoff_active))
        );
        setHandoffActive(map);
        return;
      }
    },
    [toast]
  );

  const {
    connected: isConnected,
    subscribeChat,
    sendAgentMessage,
  } = useCrmWebsocket({
    debug: false,
    onMessage: handleWsPayload,
  });

  const fetchChatLogs = useCallback(async () => {
    setLoading(true);
    try {
      // ALWAYS fetch all; filter tabs client-side
      const res = await api.get<LastChatLogWire>(
        API_CONFIG.ENDPOINTS.CHAT_LOGS,
        {
          params: { limit: 50 },
        }
      );

      const rows = res.data.chat_list.map(transformChatLog);
      setChatLogs(rows);

      const map: Record<string, boolean> = {};
      res.data.chat_list.forEach(
        (c) => (map[c.phone_number] = Boolean(c.is_handoff_active))
      );
      setHandoffActive(map);

      // keep selection if exists
      setSelectedChat((prev) => {
        if (!prev) return null;
        const found = rows.find((r) => r.phoneNumber === prev.phoneNumber);
        return found ? { ...found } : null;
      });
    } catch (e) {
      console.error("[fetchChatLogs] error:", e);
      setChatLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatLogs();
  }, [fetchChatLogs]);

  // subscribe to selected chat room (no reconnect)
  useEffect(() => {
    subscribeChat(selectedChat?.phoneNumber ?? null);
  }, [selectedChat?.phoneNumber, subscribeChat]);

  const fetchOlderMessages = useCallback(
    async (phoneNumber: string) => {
      if (!selectedChat || selectedChat.phoneNumber !== phoneNumber) return;
      if (loadingOlder) return;

      const earliestId = selectedChat.messages[0]?.id ?? 0;
      if (!earliestId || earliestId <= 1) {
        setHasMoreOlder((p) => ({ ...p, [phoneNumber]: false }));
        return;
      }

      setLoadingOlder(true);
      try {
        const last_chat_id = earliestId - 1;

        const container = scrollContainerRef.current;
        const prevScrollTop = container?.scrollTop ?? 0;
        const prevScrollHeight = container?.scrollHeight ?? 0;

        const res = await api.get<{ log: ChatItemWire[] | ChatItemWire }>(
          API_CONFIG.ENDPOINTS.CHAT_LOG_BY_PHONE(phoneNumber, last_chat_id)
        );
        const logArray = Array.isArray(res.data.log)
          ? res.data.log
          : [res.data.log];

        if (logArray.length === 0) {
          setHasMoreOlder((p) => ({ ...p, [phoneNumber]: false }));
          return;
        }

        const olderMessages = logArray.map(mapWireToMessage);

        const updated: ListRow = {
          ...selectedChat,
          messages: [...olderMessages, ...selectedChat.messages],
        };
        setSelectedChat(updated);
        setChatLogs((prev) =>
          prev.map((r) => (r.phoneNumber === phoneNumber ? updated : r))
        );

        const pageSize = 50;
        setHasMoreOlder((p) => ({
          ...p,
          [phoneNumber]: logArray.length >= pageSize,
        }));

        requestAnimationFrame(() => {
          const container2 = scrollContainerRef.current;
          if (container2 && prevScrollHeight) {
            const newScrollHeight = container2.scrollHeight;
            container2.scrollTop =
              newScrollHeight - prevScrollHeight + prevScrollTop;
          }
        });
      } catch (e) {
        console.error("[fetchOlderMessages] error:", e);
        toast({
          title: "Error",
          description: "Failed to load older messages.",
          variant: "destructive",
        });
      } finally {
        setLoadingOlder(false);
      }
    },
    [selectedChat, loadingOlder, toast]
  );

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop < 120 && selectedChat) {
      const phone = selectedChat.phoneNumber;
      const more = hasMoreOlder[phone];
      if ((more === undefined || more === true) && !loadingOlder) {
        fetchOlderMessages(phone);
      }
    }
  };

  const handleSelectChat = async (chat: ListRow) => {
    setLoadingDetail(true);
    try {
      const res = await api.get<{ log: ChatItemWire[] | ChatItemWire }>(
        API_CONFIG.ENDPOINTS.CHAT_LOG_BY_PHONE(chat.phoneNumber, 0)
      );
      const logArray = Array.isArray(res.data.log)
        ? res.data.log
        : [res.data.log];
      const messages: Message[] = logArray.map(mapWireToMessage);

      const updated = { ...chat, messages };
      setSelectedChat(updated);
      setChatLogs((prev) =>
        prev.map((r) => (r.phoneNumber === chat.phoneNumber ? updated : r))
      );

      const pageSize = 50;
      setHasMoreOlder((p) => ({
        ...p,
        [chat.phoneNumber]: logArray.length >= pageSize,
      }));

      requestAnimationFrame(() => scrollToBottom("auto"));
    } catch (e) {
      console.error("[handleSelectChat] error:", e);
      toast({
        title: "Error",
        description: "Failed to load chat details.",
        variant: "destructive",
      });
      setSelectedChat(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleHandoff = async (row: ListRow) => {
    try {
      if (!row.customerId)
        throw new Error(`Missing customerId for ${row.phoneNumber}`);

      const current = Boolean(handoffActive[row.phoneNumber]);
      const res = await api.patch(
        API_CONFIG.ENDPOINTS.HANDOFF_TOGGLE(row.customerId),
        {
          active: !current,
        }
      );

      if (res.data.status === "ok") {
        const newVal = Boolean(res.data.handoff_active);
        setHandoffActive((p) => ({ ...p, [row.phoneNumber]: newVal }));
        setChatLogs((p) =>
          p.map((r) =>
            r.phoneNumber === row.phoneNumber
              ? { ...r, handoffActive: newVal }
              : r
          )
        );
        if (selectedChat?.phoneNumber === row.phoneNumber)
          setSelectedChat({ ...selectedChat, handoffActive: newVal });

        toast({
          title: "Handoff Updated",
          description: `Switched to ${newVal ? "Human CS" : "AI Agent"}`,
        });

        await fetchChatLogs();
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (e: any) {
      console.error("[toggleHandoff] error:", e?.response || e);
      toast({
        title: "Error",
        description: `Failed to toggle handoff mode: ${extractErr(e)}`,
        variant: "destructive",
      });
    }
  };

  const resolveChat = async (row: ListRow) => {
    try {
      if (!row.customerId)
        throw new Error(`Missing customerId for ${row.phoneNumber}`);

      const res = await api.post(
        API_CONFIG.ENDPOINTS.HANDOFF_RESOLVE(row.customerId)
      );

      if (res.data.status === "ok") {
        const newVal = Boolean(res.data.handoff_active);
        setHandoffActive((p) => ({ ...p, [row.phoneNumber]: newVal }));
        setChatLogs((p) =>
          p.map((r) =>
            r.phoneNumber === row.phoneNumber
              ? { ...r, handoffActive: newVal }
              : r
          )
        );
        if (selectedChat?.phoneNumber === row.phoneNumber)
          setSelectedChat({ ...selectedChat, handoffActive: newVal });

        toast({
          title: "Conversation resolved",
          description: "Returned to AI Agent",
        });

        await fetchChatLogs();
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (e: any) {
      console.error("[resolveChat] error:", e?.response || e);
      toast({
        title: "Error",
        description: `Failed to resolve conversation: ${extractErr(e)}`,
        variant: "destructive",
      });
    }
  };

  // Search filter
  const filteredBySearch = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return chatLogs.filter((row) => row.customerName.toLowerCase().includes(q));
  }, [chatLogs, searchTerm]);

  // Tab filter (client-side)
  const filteredLogs = useMemo(() => {
    if (filterTab === "all") return filteredBySearch;

    if (filterTab === "assigned") {
      return filteredBySearch.filter((r) =>
        Boolean(handoffActive[r.phoneNumber] ?? r.handoffActive)
      );
    }

    // unassigned
    return filteredBySearch.filter(
      (r) => !Boolean(handoffActive[r.phoneNumber] ?? r.handoffActive)
    );
  }, [filteredBySearch, filterTab, handoffActive]);

  const handleNewChat = () => {
    const newChat: ListRow = {
      id: Math.max(0, ...chatLogs.map((c) => c.id)) + 1,
      phoneNumber: String(Math.floor(Math.random() * 1e11)),
      customerName: "New Customer",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "new-lead",
      agentName: "Agent",
      messages: [],
      handoffActive: false,
    };
    setChatLogs([newChat, ...chatLogs]);
    setSelectedChat(newChat);
  };

  const isHandoffOn =
    selectedChat &&
    (selectedChat.handoffActive === true ||
      Boolean(handoffActive[selectedChat.phoneNumber]));

  // SEND: only when handoff is active (human agent mode)
  const handleSendMessage = () => {
    if (!selectedChat) return;

    if (!isHandoffOn) {
      toast({
        title: "AI Agent mode",
        description: "Enable handoff before sending messages as Human CS.",
        variant: "destructive",
      });
      return;
    }

    const text = newMessage.trim();
    if (!text) return;

    // optimistic UI (AGENT message = purple/right)
    const optimistic: Message = {
      id: Date.now(),
      sender: "agent",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setSelectedChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev
    );
    setChatLogs((prev) =>
      prev.map((r) =>
        r.phoneNumber === selectedChat.phoneNumber
          ? { ...r, messages: [...r.messages, optimistic] }
          : r
      )
    );

    // Use recipient as whatsapp_id if available (from last message)
    let whatsappId: string | null = null;
    const lastMsgWithRecipient = [...selectedChat.messages].reverse().find(m => m.recipient);
    if (lastMsgWithRecipient && lastMsgWithRecipient.recipient) {
      whatsappId = lastMsgWithRecipient.recipient;
    }

    const ok = sendAgentMessage(selectedChat.phoneNumber, text, whatsappId);
    if (!ok) {
      toast({
        title: "WebSocket",
        description: "Not connected.",
        variant: "destructive",
      });
    }

    setNewMessage("");
    requestAnimationFrame(() => scrollToBottom("auto"));
  };

  useEffect(() => {
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [selectedChat?.id, selectedChat?.messages.length]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* header */}
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">Chat Logs</h1>
          <div className="text-xs text-muted-foreground">
            WS: {isConnected ? "connected" : "disconnected"}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleNewChat} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* list */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs
                value={filterTab}
                onValueChange={(v) => setFilterTab(v as any)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                  <TabsTrigger value="all">All Agent</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading chat logs...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No chat logs found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredLogs.map((row) => (
                    <div
                      key={row.id}
                      onClick={() => handleSelectChat(row)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedChat?.phoneNumber === row.phoneNumber
                          ? "bg-muted"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {row.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">
                              {row.customerName}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {row.date}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground truncate">
                            {row.messages[row.messages.length - 1]?.content ||
                              "No messages yet"}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <Badge
                              variant="secondary"
                              className={`${getStatusColor(
                                row.status
                              )} text-white text-xs`}
                            >
                              {getStatusText(row.status)}
                            </Badge>

                            <span className="text-xs text-muted-foreground">
                              {Boolean(
                                handoffActive[row.phoneNumber] ??
                                  row.handoffActive
                              )
                                ? "Assigned (handoff)"
                                : "AI Agent"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* detail */}
        <ResizablePanel defaultSize={65}>
          {loadingDetail ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                Loading chat details...
              </div>
            </div>
          ) : selectedChat ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedChat.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2 className="font-semibold">
                      {selectedChat.customerName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Product not specified • {selectedChat.agentName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isHandoffOn && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleHandoff(selectedChat)}
                        title="Enable handoff (route to human)"
                      >
                        <Handshake className="h-4 w-4 mr-2" />
                        Enable Handoff
                      </Button>
                    )}

                    {(filterTab === "assigned" || isHandoffOn) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => resolveChat(selectedChat)}
                      >
                        Resolve
                      </Button>
                    )}

                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(
                        selectedChat.status
                      )} text-white`}
                    >
                      {getStatusText(selectedChat.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div
                  ref={scrollContainerRef}
                  onScroll={onScroll}
                  className="flex-1 overflow-auto p-4"
                  style={{ maxHeight: "100%" }}
                >
                  <div className="space-y-4">
                    {loadingOlder && (
                      <div className="text-center text-xs text-muted-foreground">
                        Loading older messages...
                      </div>
                    )}

                    {selectedChat.messages.map((m) => {
                      const isRight = m.sender === "ai" || m.sender === "agent";
                      const bubbleClass = isRight
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground";

                      const Icon =
                        m.sender === "ai"
                          ? Bot
                          : m.sender === "agent"
                          ? User
                          : User;

                      return (
                        <div
                          key={m.id}
                          className={`flex ${
                            isRight ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-start gap-2 max-w-[70%] ${
                              isRight ? "flex-row-reverse" : ""
                            }`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <Icon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>

                            <div
                              className={`rounded-lg p-3 ${bubbleClass}`}
                              title={m.recipient ? `Recipient: ${m.recipient}` : undefined}
                            >
                              <p className="text-sm">{m.content}</p>
                              <span className="text-xs opacity-70 mt-1 block">
                                {m.timestamp}
                                {m.recipient && m.sender === "customer" && (
                                  <>
                                    <span className="mx-1">·</span>
                                    <span className="text-[10px] text-purple-500">To: {m.recipient}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={endRef} />
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={
                      isHandoffOn
                        ? "Type a message as Human CS..."
                        : "AI Agent mode. Enable handoff to reply."
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
                    disabled={!isHandoffOn}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="self-end"
                    disabled={!isHandoffOn || !newMessage.trim()}
                    title={!isHandoffOn ? "Enable handoff first" : "Send"}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a chat from the list to view the conversation
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatDialog;
