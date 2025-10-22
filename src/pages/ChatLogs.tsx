import { useState, useEffect, useRef, useCallback } from "react";
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
import { Download, Plus, Search, Send, Bot, User } from "lucide-react";
import api from "@/lib/api";
import { API_CONFIG } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

/* ----------------------------- Types ----------------------------- */
type Sender = "ai" | "human";
interface Message {
  id: number;
  sender: Sender;
  content: string;
  timestamp: string;
}
type Status = "new-lead" | "interested" | "closed" | "no-interest";
interface ListRow {
  id: number;
  phoneNumber: string;
  customerName: string;
  date: string;
  status: Status;
  agentName: string;
  customerId?: number; // used for PATCH/POST endpoints
  handoffActive?: boolean;
  messages: Message[];
}
interface ChatItemWire {
  chat_id: number;
  message: string;
  created_at: string;
  role?: "ai" | "human" | "interrupt";
}
interface ApiChatLogWire {
  phone_number: string;
  customer_name: string;
  customer_id?: number; // make sure backend returns this
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

const transformChatLog = (apiChatLog: ApiChatLogWire): ListRow => {
  const logArray = Array.isArray(apiChatLog.log)
    ? apiChatLog.log
    : [apiChatLog.log];

  const messages: Message[] = logArray.map((item, i) => ({
    id: item.chat_id,
    sender:
      item.role === "ai" || item.role === "interrupt"
        ? "ai"
        : item.role === "human"
        ? "human"
        : i % 2 === 0
        ? "ai"
        : "human",
    content: item.message,
    timestamp: new Date(item.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

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
    customerId: apiChatLog.customer_id, // keep the PK from API
    messages,
  };
};

// Extracts a readable error message from Axios/Fetch errors
const extractErr = (e: any) =>
  e?.response?.data?.detail ||
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.message ||
  "Unknown error";

/* ----------------------------- Component ----------------------------- */
const ChatLogs = () => {
  const [chatLogs, setChatLogs] = useState<ListRow[]>([]);
  const [selectedChat, setSelectedChat] = useState<ListRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { toast } = useToast();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [handoffActive, setHandoffActive] = useState<Record<string, boolean>>(
    {}
  );
  const [filterTab, setFilterTab] = useState<"all" | "assigned" | "unassigned">(
    "assigned"
  );
  // New states for infinite scroll
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState<Record<string, boolean>>({}); // per phone

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // central fetch that respects current tab
  const fetchChatLogs = async (tab: typeof filterTab) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 50 };
      if (tab === "assigned") params.handoff = "assigned";
      else if (tab === "unassigned") params.handoff = "unassigned";

      const res = await api.get<LastChatLogWire>(
        API_CONFIG.ENDPOINTS.CHAT_LOGS,
        { params }
      );

      const rows = res.data.chat_list.map(transformChatLog);
      setChatLogs(rows);

      const map: Record<string, boolean> = {};
      res.data.chat_list.forEach((c) => {
        map[c.phone_number] = Boolean(c.is_handoff_active);
      });
      setHandoffActive(map);

      setSelectedChat(null);
    } catch (e) {
      console.error("[fetchChatLogs] error:", e);
      setChatLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // initial + on tab change
  useEffect(() => {
    fetchChatLogs(filterTab); /* eslint-disable-next-line */
  }, [filterTab]);

  // WebSocket (optional)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const socket = new WebSocket(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WEBSOCKET}?token=${token}`
    );
    setWs(socket);
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    socket.onmessage = (evt) => console.log("WS:", evt.data);
    return () => socket.close();
  }, []);

  // Map server wire item -> Message (reuse mapping logic)
  const mapWireToMessage = (it: ChatItemWire): Message => ({
    id: it.chat_id,
    sender: it.role === "ai" || it.role === "interrupt" ? "ai" : "human",
    content: it.message,
    timestamp: new Date(it.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  // Fetch older messages (prepend). Uses last_chat_id = earliestId - 1
  const fetchOlderMessages = useCallback(
    async (phoneNumber: string) => {
      if (!selectedChat || selectedChat.phoneNumber !== phoneNumber) return;
      if (loadingOlder) return;

      const earliestId = selectedChat.messages[0]?.id ?? 0;
      if (!earliestId || earliestId <= 1) {
        // nothing older
        setHasMoreOlder((p) => ({ ...p, [phoneNumber]: false }));
        return;
      }

      setLoadingOlder(true);
      try {
        const last_chat_id = earliestId - 1;
        // preserve scroll measurements to restore position after prepend
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

        // Prepend older messages and keep selectedChat reference
        const updated: ListRow = {
          ...selectedChat,
          messages: [...olderMessages, ...selectedChat.messages],
        };
        setSelectedChat(updated);
        setChatLogs((prev) =>
          prev.map((r) => (r.phoneNumber === phoneNumber ? updated : r))
        );

        // If server returned less than page size, assume no more older messages
        const pageSize = 50; // backend limit
        if (logArray.length < pageSize) {
          setHasMoreOlder((p) => ({ ...p, [phoneNumber]: false }));
        } else {
          setHasMoreOlder((p) => ({ ...p, [phoneNumber]: true }));
        }

        // wait for DOM update, then restore scroll so UI doesn't jump
        requestAnimationFrame(() => {
          const container2 = scrollContainerRef.current;
          if (container2 && prevScrollHeight) {
            const newScrollHeight = container2.scrollHeight;
            container2.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
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

  // onScroll handler - load older when near top
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // threshold: 120px from top to trigger older load
    if (target.scrollTop < 120 && selectedChat) {
      const phone = selectedChat.phoneNumber;
      const more = hasMoreOlder[phone];
      // if we have never set hasMoreOlder for this phone, assume true
      if ((more === undefined || more === true) && !loadingOlder) {
        fetchOlderMessages(phone);
      }
    }
  };

  // detail fetch
  const handleSelectChat = async (chat: ListRow) => {
    setLoadingDetail(true);
    try {
      // Always fetch the latest page (last_chat_id=0) when opening a chat.
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

      // decide hasMoreOlder for this conversation: if we got full page, assume more is available
      const pageSize = 50;
      setHasMoreOlder((p) => ({
        ...p,
        [chat.phoneNumber]: logArray.length >= pageSize,
      }));

      // scroll to bottom after render finishes
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
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

  // Toggle handoff (use real contactId; send JSON body)
  const toggleHandoff = async (row: ListRow) => {
    try {
      if (!row.customerId) {
        const msg = `Missing customerId for ${row.phoneNumber}`;
        console.error("[toggleHandoff]", msg, row);
        throw new Error(msg);
      }
      const current = Boolean(handoffActive[row.phoneNumber]);
      console.debug(
        "[toggleHandoff] customerId=%s phone=%s -> %s",
        row.customerId,
        row.phoneNumber,
        !current
      );
      const res = await api.patch(
        API_CONFIG.ENDPOINTS.HANDOFF_TOGGLE(row.customerId),
        { active: !current } // JSON body
      );
      console.debug("[toggleHandoff] response:", res.status, res.data);
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
        await fetchChatLogs(filterTab);
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

  // Resolve → hand back to AI
  const resolveChat = async (row: ListRow) => {
    try {
      if (!row.customerId) {
        const msg = `Missing customerId for ${row.phoneNumber}`;
        console.error("[resolveChat]", msg, row);
        throw new Error(msg);
      }
      console.debug(
        "[resolveChat] customerId=%s phone=%s",
        row.customerId,
        row.phoneNumber
      );
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
        if (selectedChat?.phoneNumber === row.phoneNumber) {
          setSelectedChat({ ...selectedChat, handoffActive: newVal });
        }
        toast({
          title: "Conversation resolved",
          description: "Returned to AI Agent",
        });
        await fetchChatLogs(filterTab);
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

  // filter client-side (still useful with search)
  const filteredLogs = chatLogs.filter((row) => {
    const matchesSearch =
      row.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row as any).productDiscussed
        ?.toLowerCase?.()
        .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    return true; // server already filtered for assigned/unassigned
  });

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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const newMsg: Message = {
      id: Math.max(0, ...selectedChat.messages.map((m) => m.id)) + 1,
      sender: "ai",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMsg],
    };
    setSelectedChat(updated);
    setChatLogs((prev) =>
      prev.map((r) => (r.phoneNumber === updated.phoneNumber ? updated : r))
    );
    setNewMessage("");

    // scroll after render completes
    requestAnimationFrame(() => scrollToBottom("smooth"));
  };

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    // scroll the sentinel into view — works inside custom ScrollArea as well
    endRef.current?.scrollIntoView({ behavior, block: "nearest" });
  };

  // whenever selected chat or number of messages changes, scroll to bottom
  useEffect(() => {
    // use microtask so DOM updates finish first
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [selectedChat?.id, selectedChat?.messages.length]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* header */}
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">Chat Logs</h1>
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
                        selectedChat?.id === row.id ? "bg-muted" : ""
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
                              {row.agentName}
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
                {/* header unchanged */}
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
                    {(filterTab === "assigned" ||
                      selectedChat.handoffActive === true ||
                      Boolean(handoffActive[selectedChat.phoneNumber])) && (
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

              {/* IMPORTANT: put an inner scrollable DIV we can ref & attach onScroll to */}
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
                    {selectedChat.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.sender === "ai" ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div
                          className={`flex items-start gap-2 max-w-[70%] ${m.sender === "ai" ? "flex-row-reverse" : ""
                            }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {m.sender === "ai" ? (
                                <Bot className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${m.sender === "ai"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                              }`}
                          >
                            <p className="text-sm">{m.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {m.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
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

export default ChatLogs;
