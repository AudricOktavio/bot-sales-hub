import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AgentCard from "@/components/AgentCard";
import AgentChatDialog from "@/components/AgentChatDialog";
import axios from "axios";
import { getApiUrl } from "@/config/api";

type AgentStatus = "active" | "inactive" | "pending";

interface ApiAgent {
  agent_id: number;
  agent_name: string;
  category: string;
  phone_number_id: string;
  prompt?: string | null;
  handover_prompt?: string | null;
  allow_default_handover?: boolean | null; // <- may be missing/null on older rows
}

interface Agent {
  id: number;
  name: string;
  description: string;
  category: string;
  status: AgentStatus;
  leadsGenerated: number;
  conversionRate: string;
}

interface NewAgent {
  id: number;
  name: string;
  description: string;
  category: string;
  prompt: string;
  handover_prompt: string;
  phone_number_id: string;
  status: AgentStatus;
  allow_default_handover: boolean; // <- toggle
}

const AgentManagement = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [chatAgentId, setChatAgentId] = useState<number>(0);
  const [chatAgentName, setChatAgentName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [newAgent, setNewAgent] = useState<NewAgent>({
    id: 0,
    name: "",
    description: "",
    category: "",
    prompt: "",
    handover_prompt: "",
    phone_number_id: "",
    status: "pending",
    allow_default_handover: false,
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.get<ApiAgent[]>(getApiUrl("AGENTS"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted: Agent[] = data.map((a) => ({
        id: a.agent_id,
        name: a.agent_name,
        description: a.prompt || "No description provided",
        category: a.category,
        status: "active",
        // demo stats
        leadsGenerated: Math.floor(Math.random() * 50),
        conversionRate: `${(Math.random() * 30).toFixed(1)}%`,
      }));

      setAgents(formatted);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      toast({
        title: "Error",
        description: "Failed to load agents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      agent.name.toLowerCase().includes(q) ||
      agent.description.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(agents.map((a) => a.category)));

  const handleCreateAgent = () => {
    setIsEditing(false);
    setNewAgent({
      id: 0,
      name: "",
      description: "",
      category: "",
      prompt: "",
      handover_prompt: "",
      phone_number_id: "",
      status: "pending",
      allow_default_handover: false, // reset
    });
    setIsDialogOpen(true);
  };

  const handleEditAgent = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.get<ApiAgent>(getApiUrl("AGENT_BY_ID", id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(true);
      setNewAgent({
        id: data.agent_id,
        name: data.agent_name,
        description: data.prompt || "No description provided",
        category: data.category,
        prompt: data.prompt || "",
        handover_prompt: data.handover_prompt || "",
        phone_number_id: data.phone_number_id,
        status: "active",
        allow_default_handover: Boolean(data.allow_default_handover),
      });
      setIsDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch agent details:", err);
      toast({
        title: "Error",
        description: "Failed to load agent details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgent = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(getApiUrl("AGENT_BY_ID", id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Agent Deleted",
        description: "The AI agent has been successfully deleted",
      });
    } catch (err) {
      console.error("Failed to delete agent:", err);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAgent = async () => {
    if (!newAgent.name || !newAgent.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in agent name, category",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        agent_name: newAgent.name,
        category: newAgent.category,
        prompt: newAgent.prompt || undefined,
        handover_prompt: newAgent.handover_prompt || undefined,
        allow_default_handover: newAgent.allow_default_handover, // <- persist
      };

      if (isEditing) {
        await axios.put(getApiUrl("AGENT_BY_ID", newAgent.id), payload, {
          headers,
        });
        toast({
          title: "Agent Updated",
          description: `${newAgent.name} has been updated successfully`,
        });
      } else {
        await axios.post(getApiUrl("AGENTS"), payload, { headers });
        toast({
          title: "Agent Created",
          description: `${newAgent.name} has been created successfully`,
        });
      }

      await fetchAgents();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to save agent:", err);
      toast({
        title: "Error",
        description: "Failed to save agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChatAgent = (id: number) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    setChatAgentId(id);
    setChatAgentName(agent.name);
    setIsChatDialogOpen(true);
  };

  return (
    <div className="crm-container">
      <div className="flex flex-col space-y-4 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-responsive-xl font-bold">
              AI Agent Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Configure and manage AI sales agents
            </p>
          </div>
          <Button onClick={handleCreateAgent} className="w-full sm:w-auto">
            Add New Agent
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      ) : (
        <div className="mobile-grid">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              {...agent}
              onEdit={handleEditAgent}
              onDelete={handleDeleteAgent}
              onChat={handleChatAgent}
            />
          ))}
          {filteredAgents.length === 0 && (
            <div className="col-span-full text-center py-12 bg-muted/30 rounded-md">
              <p className="text-muted-foreground">
                {agents.length === 0
                  ? "No agents created yet"
                  : "No agents match your search criteria"}
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mobile-dialog max-w-6xl mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-responsive-lg">
              {isEditing ? "Edit AI Agent" : "Create New AI Agent"}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Configure the AI agent's settings and personality to optimize
              sales performance.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Agent Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Tech Sales Specialist"
                  value={newAgent.name}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Input
                  id="category"
                  placeholder="e.g. Software, Hardware, Services"
                  value={newAgent.category}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, category: e.target.value })
                  }
                />
              </div>

              {/* Allow Default Handover toggle */}
              <div className="space-y-2">
                <Label
                  htmlFor="allow_default_handover"
                  className="text-sm font-medium"
                >
                  Allow Default Handover (fallback rules)
                </Label>
                <div className="flex items-start gap-3 rounded-md border p-3">
                  <input
                    id="allow_default_handover"
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={newAgent.allow_default_handover}
                    onChange={(e) =>
                      setNewAgent({
                        ...newAgent,
                        allow_default_handover: e.target.checked,
                      })
                    }
                  />
                  <Label
                    htmlFor="allow_default_handover"
                    className="text-xs text-muted-foreground"
                  >
                    If no custom handover prompt is set, allow the model to use
                    default escalation rules.
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Sales Prompt (Optional)
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Instructions for how the AI should behave and sell..."
                  className="resize-none min-h-[160px]"
                  rows={4}
                  value={newAgent.prompt}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, prompt: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Define how the AI approaches conversations and
                  sales.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="handover_prompt"
                  className="text-sm font-medium"
                >
                  Handover Prompt (Optional)
                </Label>
                <Textarea
                  id="handover_prompt"
                  placeholder="Rules for when to hand over to a human or switch agents..."
                  className="resize-none min-h-[160px]"
                  rows={4}
                  value={newAgent.handover_prompt}
                  onChange={(e) =>
                    setNewAgent({
                      ...newAgent,
                      handover_prompt: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Define when the AI should hand over to a human agent
                  or switch. If empty and the toggle above is off, the AI will
                  not be able to hand over.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAgent} className="w-full sm:w-auto">
              {isEditing ? "Update Agent" : "Create Agent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AgentChatDialog
        isOpen={isChatDialogOpen}
        onClose={() => setIsChatDialogOpen(false)}
        agentId={chatAgentId}
        agentName={chatAgentName}
      />
    </div>
  );
};

export default AgentManagement;
