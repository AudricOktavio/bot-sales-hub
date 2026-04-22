import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { useCrmWebsocket } from "@/hooks/useCrmWebsocket";

interface Message {
  content: string;
  sender: "customer" | "ai" | "agent";
  timestamp: Date;
}

interface AgentChatPanelProps {
  agentId: number;
  agentName: string;
  /** bumped by parent to reset chat after Save */
  resetKey?: number;
}

const DEMO_PHONE = "123456789";

const AgentChatPanel = ({ agentId, agentName, resetKey = 0 }: AgentChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const appendIfNotDuplicate = useCallback(
    (sender: Message["sender"], text: string, ts?: Date) => {
      const t = text.trim();
      if (!t) return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === sender && last.content === t) return prev;
        return [...prev, { sender, content: t, timestamp: ts ?? new Date() }];
      });
    },
    []
  );

  const { connected: wsConnected, subscribeChat } = useCrmWebsocket({
    debug: false,
    onMessage: (payload) => {
      const type = payload?.type;
      if (type === "error") {
        toast({
          title: "WebSocket error",
          description: String(payload?.message ?? "Unknown error"),
          variant: "destructive",
        });
        return;
      }
      if (type === "chat_update") {
        const phone = String(payload?.phone_number ?? payload?.data?.phone_number ?? "");
        if (phone !== DEMO_PHONE) return;
        const data = payload?.data ?? {};
        const log = Array.isArray(data.log) ? data.log : data.log ? [data.log] : [];
        if (!log.length) return;
        const rebuilt: Message[] = [];
        for (const it of log) {
          const role = String(it?.role ?? "").toLowerCase();
          const text = String(it?.message ?? "");
          const createdAt = it?.created_at ? new Date(it.created_at) : new Date();
          if (!text.trim()) continue;
          if (role === "human") rebuilt.push({ sender: "customer", content: text, timestamp: createdAt });
          else if (role === "agent") rebuilt.push({ sender: "agent", content: text, timestamp: createdAt });
          else if (role === "ai" || role === "interrupt") rebuilt.push({ sender: "ai", content: text, timestamp: createdAt });
          else rebuilt.push({ sender: "customer", content: text, timestamp: createdAt });
        }
        setMessages(rebuilt);
        setIsLoading(false);
      }
    },
  });

  // Reset on agent change or after save
  useEffect(() => {
    setMessages([]);
    setCurrentMessage("");
    setIsLoading(false);
  }, [agentId, resetKey]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [agentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    subscribeChat(DEMO_PHONE);
    return () => subscribeChat(null);
  }, [subscribeChat, agentId]);

  const sendViaRest = async (text: string) => {
    const token = localStorage.getItem("access_token");
    const payload = { messages: [{ content: text }], phone_number: DEMO_PHONE };
    const { data } = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENT_CHAT(agentId)}`,
      payload,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    return (data?.response ?? "").toString();
  };

  const handleSendMessage = async () => {
    const text = currentMessage.trim();
    if (!text || isLoading) return;
    appendIfNotDuplicate("customer", text, new Date());
    setCurrentMessage("");
    setIsLoading(true);
    try {
      const reply = await sendViaRest(text);
      if (!wsConnected) {
        if (reply.trim()) appendIfNotDuplicate("ai", reply, new Date());
        setIsLoading(false);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      toast({
        title: status === 401 ? "Unauthorized" : "Chat Error",
        description: status === 401 ? "Please sign in again." : "Failed to send message.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 font-medium">
          <MessageCircle className="h-5 w-5" />
          Test Chat — {agentName}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Chatting as customer <code>{DEMO_PHONE}</code> · WS:{" "}
          {wsConnected ? "connected" : "disconnected"}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with {agentName}</p>
            </div>
          )}

          {messages.map((m, i) => {
            const isCustomer = m.sender === "customer";
            const isRight = isCustomer;
            const bubbleClass = isCustomer
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground";
            const Icon = isCustomer ? User : m.sender === "ai" ? Bot : User;
            return (
              <div key={i} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${isRight ? "flex-row-reverse" : ""}`}>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${bubbleClass}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className="text-xs opacity-70 mt-1">{m.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg px-4 py-2 animate-pulse">
                <span className="text-sm text-muted-foreground">Agent is typing…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Type your message as customer..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isLoading} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AgentChatPanel;
