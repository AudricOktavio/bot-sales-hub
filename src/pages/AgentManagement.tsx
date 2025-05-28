
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AgentCard from '@/components/AgentCard';

// Define agent status type to ensure consistency
type AgentStatus = 'active' | 'inactive' | 'pending';

// Define the agent interface
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
  personality: string;
  status: AgentStatus;
}

// Demo data for agents
const initialAgents: Agent[] = [
  {
    id: 1,
    name: 'Agent Alpha',
    description: 'Specialized in software sales with a focus on enterprise clients. Uses a consultative approach to identify client needs.',
    category: 'Software',
    status: 'active',
    leadsGenerated: 42,
    conversionRate: '28.5%',
  },
  {
    id: 2,
    name: 'Agent Beta',
    description: 'Focuses on hardware solutions for small and medium businesses. Takes a friendly, solutions-oriented approach.',
    category: 'Hardware',
    status: 'active',
    leadsGenerated: 38,
    conversionRate: '23.7%',
  },
  {
    id: 3,
    name: 'Agent Gamma',
    description: 'Specializes in cloud services and SaaS products. Technical expertise with a focus on ROI and scalability.',
    category: 'Cloud Services',
    status: 'active',
    leadsGenerated: 27,
    conversionRate: '19.2%',
  },
  {
    id: 4,
    name: 'Agent Delta',
    description: 'New agent configured for selling premium support packages. Trained to identify customer pain points.',
    category: 'Support',
    status: 'pending',
    leadsGenerated: 0,
    conversionRate: '0%',
  },
];

const AgentManagement = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  
  const [newAgent, setNewAgent] = useState<NewAgent>({
    id: 0,
    name: '',
    description: '',
    category: '',
    prompt: '',
    personality: '',
    status: 'pending',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
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
      personality: '',
      status: 'pending',
    });
    setIsDialogOpen(true);
  };
  
  const handleEditAgent = (id: number) => {
    const agentToEdit = agents.find(agent => agent.id === id);
    if (agentToEdit) {
      setIsEditing(true);
      setNewAgent({
        id: agentToEdit.id,
        name: agentToEdit.name,
        description: agentToEdit.description,
        category: agentToEdit.category,
        status: agentToEdit.status,
        prompt: 'Sell [product] to [customer type] by highlighting [key benefits]. Focus on [customer pain points].',
        personality: agentToEdit.category === 'Software' ? 'Technical Expert' : 'Friendly Consultant',
      });
      setIsDialogOpen(true);
    }
  };
  
  const handleDeleteAgent = (id: number) => {
    setAgents(agents.filter(agent => agent.id !== id));
    toast({
      title: "Agent Deleted",
      description: "The AI agent has been successfully deleted",
    });
  };
  
  const handleSaveAgent = () => {
    if (!newAgent.name || !newAgent.category || !newAgent.description || !newAgent.prompt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      setAgents(agents.map(agent => agent.id === newAgent.id ? {
        ...agent,
        name: newAgent.name,
        description: newAgent.description,
        category: newAgent.category,
        status: newAgent.status
      } : agent));
      
      toast({
        title: "Agent Updated",
        description: `${newAgent.name} has been updated successfully`,
      });
    } else {
      const newId = Math.max(...agents.map(a => a.id), 0) + 1;
      setAgents([...agents, {
        id: newId, 
        name: newAgent.name, 
        description: newAgent.description,
        category: newAgent.category,
        status: newAgent.status,
        leadsGenerated: 0, 
        conversionRate: '0%'
      }]);
      
      toast({
        title: "Agent Created",
        description: `${newAgent.name} has been created successfully`,
      });
    }
    
    setIsDialogOpen(false);
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
      
      <div className="mobile-grid">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            {...agent}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
          />
        ))}
        {filteredAgents.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">No agents match your search criteria</p>
          </div>
        )}
      </div>
      
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
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this agent specializes in..."
                  className="resize-none min-h-[100px]"
                  rows={4}
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">Sales Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Instructions for how the AI should sell..."
                  className="resize-none min-h-[100px]"
                  rows={4}
                  value={newAgent.prompt}
                  onChange={(e) => setNewAgent({...newAgent, prompt: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Define how the AI approaches sales conversations. Use [brackets] for variables.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personality" className="text-sm font-medium">Personality Type</Label>
                <Select 
                  value={newAgent.personality} 
                  onValueChange={(value) => setNewAgent({...newAgent, personality: value})}
                >
                  <SelectTrigger id="personality">
                    <SelectValue placeholder="Select a personality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Friendly Consultant">Friendly Consultant</SelectItem>
                      <SelectItem value="Technical Expert">Technical Expert</SelectItem>
                      <SelectItem value="Relationship Builder">Relationship Builder</SelectItem>
                      <SelectItem value="Problem Solver">Problem Solver</SelectItem>
                      <SelectItem value="Strategic Advisor">Strategic Advisor</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
    </div>
  );
};

export default AgentManagement;
