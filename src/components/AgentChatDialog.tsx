import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AgentChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: number;
  agentName: string;
  /** Not used in Test Chat. We always use a single fixed demo number. */
  phoneNumber?: string;
}

const DEMO_PHONE = "123456789"; // one fixed demo identity

const AgentChatDialog = ({
  isOpen,
  onClose,
  agentId,
  agentName,
}: AgentChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMessages([]);
      setCurrentMessage("");
      setIsLoading(false);
      onClose();
    }
  };

  const handleSendMessage = async () => {
    const text = currentMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      content: text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        messages: [{ content: text }],
        phone_number: DEMO_PHONE, // 👈 always the same
      };

      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENT_CHAT(agentId)}`,
        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      const reply: string = (data?.response ?? "").toString();
      if (!reply.trim()) {
        // handoff active or intentionally silent ⇒ don't append agent bubble
        toast({
          title: "Human handoff active",
          description:
            "AI is paused for this conversation until you press Resolve.",
        });
        return;
      }

      const agentMessage: Message = {
        content: reply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const status = error?.response?.status;
      toast({
        title: status === 401 ? "Unauthorized" : "Chat Error",
        description:
          status === 401
            ? "Please sign in again."
            : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with {agentName}
          </DialogTitle>
          <DialogDescription>
            Test this agent. When human handoff is active, the AI will pause
            automatically. You’re chatting as <code>{DEMO_PHONE}</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 border rounded-md p-4 mb-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with {agentName}</p>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      m.isUser ? "bg-primary text-white" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {m.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 animate-pulse">
                    <span className="text-sm text-muted-foreground">
                      Agent is typing…
                    </span>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentChatDialog;
