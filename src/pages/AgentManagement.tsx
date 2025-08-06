
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AgentCard from '@/components/AgentCard';
import AgentChatDialog from '@/components/AgentChatDialog';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Define agent status type to ensure consistency
type AgentStatus = 'active' | 'inactive' | 'pending';

// Define the API agent interface
interface ApiAgent {
  agent_id: number;
  agent_name: string;
  category: string;
  prompt: string;
  phone_number_id: string;
}

// Define the agent interface for display
interface Agent {
  id: number;
  name: string;
  description: string;
  category: string;
  status: AgentStatus;
  leadsGenerated: number;
  conversionRate: string;
}

// Define the new agent interface
interface NewAgent {
  id: number;
  name: string;
  description: string;
  category: string;
  prompt: string;
  phone_number_id: string;
  status: AgentStatus;
}

const AgentManagement = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [chatAgentId, setChatAgentId] = useState<number>(0);
  const [chatAgentName, setChatAgentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  
  const [newAgent, setNewAgent] = useState<NewAgent>({
    id: 0,
    name: '',
    description: '',
    category: '',
    prompt: '',
    phone_number_id: '',
    status: 'pending',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Load agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const apiAgents: ApiAgent[] = response.data;
      
      const formattedAgents: Agent[] = apiAgents.map(agent => ({
        id: agent.agent_id,
        name: agent.agent_name,
        description: agent.prompt || 'No description provided',
        category: agent.category,
        status: 'active' as AgentStatus,
        leadsGenerated: Math.floor(Math.random() * 50), // Demo data
        conversionRate: `${(Math.random() * 30).toFixed(1)}%`, // Demo data
      }));
      
      setAgents(formattedAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast({
        title: "Error",
        description: "Failed to load agents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const uniqueCategories = Array.from(new Set(agents.map(agent => agent.category)));

  const handleCreateAgent = () => {
    setIsEditing(false);
    setNewAgent({
      id: 0,
      name: '',
      description: '',
      category: '',
      prompt: '',
      phone_number_id: '',
      status: 'pending',
    });
    setIsDialogOpen(true);
  };
  
  const handleEditAgent = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/agents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const agent: ApiAgent = response.data;
      
      setIsEditing(true);
      setNewAgent({
        id: agent.agent_id,
        name: agent.agent_name,
        description: agent.prompt || 'No description provided',
        category: agent.category,
        prompt: agent.prompt,
        phone_number_id: agent.phone_number_id,
        status: 'active',
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
      toast({
        title: "Error",
        description: "Failed to load agent details. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAgent = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_CONFIG.BASE_URL}/agents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAgents(agents.filter(agent => agent.id !== id));
      toast({
        title: "Agent Deleted",
        description: "The AI agent has been successfully deleted",
      });
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveAgent = async () => {
    if (!newAgent.name || !newAgent.category || !newAgent.phone_number_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in agent name, category, and phone number ID",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const token = localStorage.getItem('access_token');
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const payload = {
        agent_name: newAgent.name,
        category: newAgent.category,
        prompt: newAgent.prompt || undefined,
        phone_number_id: newAgent.phone_number_id,
      };
  
      let response;
  
      if (isEditing) {
        response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`, payload, { headers });
        toast({
          title: "Agent Updated",
          description: `${newAgent.name} has been updated successfully`,
        });
      } else {
        response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`, payload, { headers });
        toast({
          title: "Agent Created",
          description: `${newAgent.name} has been created successfully`,
        });
      }
  
      await fetchAgents();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save agent:', error);
      toast({
        title: "Error",
        description: "Failed to save agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChatAgent = (id: number) => {
    const agent = agents.find(a => a.id === id);
    if (agent) {
      setChatAgentId(id);
      setChatAgentName(agent.name);
      setIsChatDialogOpen(true);
    }
  };
  
  return (
    <div className="crm-container">
      <div className="flex flex-col space-y-4 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-responsive-xl font-bold">AI Agent Management</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Configure and manage AI sales agents</p>
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
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
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
          {filteredAgents.map(agent => (
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
                {agents.length === 0 ? 'No agents created yet' : 'No agents match your search criteria'}
              </p>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mobile-dialog max-w-4xl mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-responsive-lg">
              {isEditing ? 'Edit AI Agent' : 'Create New AI Agent'}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Configure the AI agent's settings and personality to optimize sales performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Tech Sales Specialist"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Software, Hardware, Services"
                  value={newAgent.category}
                  onChange={(e) => setNewAgent({...newAgent, category: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number_id" className="text-sm font-medium">Phone Number ID</Label>
                <Input
                  id="phone_number_id"
                  placeholder="e.g. phone_number_123"
                  value={newAgent.phone_number_id}
                  onChange={(e) => setNewAgent({...newAgent, phone_number_id: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">Sales Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Instructions for how the AI should behave and sell..."
                  className="resize-none min-h-[120px]"
                  rows={5}
                  value={newAgent.prompt}
                  onChange={(e) => setNewAgent({...newAgent, prompt: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Define how the AI approaches conversations and sales.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveAgent} className="w-full sm:w-auto">
              {isEditing ? 'Update Agent' : 'Create Agent'}
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
