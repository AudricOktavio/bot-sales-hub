
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChatLogViewer from '@/components/ChatLogViewer';

// Demo chat log data
const initialChatLogs = [
  {
    id: 1,
    agentName: "Agent Alpha",
    customerName: "Sarah Johnson",
    date: "May 20, 2025",
    status: "closed" as const,
    productDiscussed: "Enterprise Cloud Storage",
    dealValue: "$4,999.90",
    messages: [
      {
        id: 1,
        sender: "bot" as const,
        content: "Hello Sarah! I noticed you were looking at our Enterprise Cloud Storage solutions. How can I help you today?",
        timestamp: "10:30 AM"
      },
      {
        id: 2,
        sender: "customer" as const,
        content: "Hi there! Yes, we're looking to upgrade our current storage solution. Can you tell me about your security features?",
        timestamp: "10:32 AM"
      },
      {
        id: 3,
        sender: "bot" as const,
        content: "Absolutely! Our Enterprise Cloud Storage comes with end-to-end encryption, multi-factor authentication, and compliance with ISO 27001, GDPR, and HIPAA standards. Would you like me to elaborate on any specific security aspect?",
        timestamp: "10:33 AM"
      },
      {
        id: 4,
        sender: "customer" as const,
        content: "That sounds promising. We handle sensitive customer data, so GDPR compliance is essential. What about data recovery options?",
        timestamp: "10:35 AM"
      },
      {
        id: 5,
        sender: "bot" as const,
        content: "Great question! We offer point-in-time recovery for up to 30 days by default, with options to extend to 90 or 180 days. Our system also includes automated backups every 6 hours and geographic redundancy across multiple data centers.",
        timestamp: "10:37 AM"
      },
      {
        id: 6,
        sender: "customer" as const,
        content: "That's exactly what we need. Can we set up a call with your sales team to discuss pricing for about 500 users?",
        timestamp: "10:40 AM"
      },
    ]
  },
  {
    id: 2,
    agentName: "Agent Beta",
    customerName: "Michael Wong",
    date: "May 20, 2025",
    status: "interested" as const,
    productDiscussed: "Professional CRM License",
    messages: [
      {
        id: 1,
        sender: "bot" as const,
        content: "Hello Michael! I see you're exploring our Professional CRM system. Is there anything specific I can help you understand about this solution?",
        timestamp: "11:15 AM"
      },
      {
        id: 2,
        sender: "customer" as const,
        content: "Hi, yes. We currently use a competitor's CRM but we're looking for something with better analytics. What does your system offer?",
        timestamp: "11:18 AM"
      },
      {
        id: 3,
        sender: "bot" as const,
        content: "Our Professional CRM includes advanced analytics powered by AI, giving you actionable insights on customer behavior, sales performance, and market trends. You can create custom reports and dashboards with drag-and-drop simplicity, and our predictive analytics can forecast sales opportunities.",
        timestamp: "11:20 AM"
      },
      {
        id: 4,
        sender: "customer" as const,
        content: "That sounds interesting. Do you offer data migration from other CRM systems?",
        timestamp: "11:23 AM"
      },
    ]
  },
  {
    id: 3,
    agentName: "Agent Gamma",
    customerName: "Elena Rodriguez",
    date: "May 19, 2025",
    status: "new-lead" as const,
    productDiscussed: "Data Security Suite",
    messages: [
      {
        id: 1,
        sender: "bot" as const,
        content: "Hello Elena! Welcome to our website. I see you're browsing our Data Security Suite. How can I assist you today?",
        timestamp: "3:45 PM"
      },
      {
        id: 2,
        sender: "customer" as const,
        content: "Hi, I'm just looking around. We've had some security concerns recently and I'm researching potential solutions.",
        timestamp: "3:47 PM"
      },
      {
        id: 3,
        sender: "bot" as const,
        content: "I understand the importance of addressing security concerns promptly. Our Data Security Suite provides comprehensive protection including threat detection, vulnerability management, and real-time monitoring. Would you like to know more about any specific aspect?",
        timestamp: "3:48 PM"
      },
    ]
  },
  {
    id: 4,
    agentName: "Agent Alpha",
    customerName: "Thomas Brown",
    date: "May 18, 2025",
    status: "closed" as const,
    productDiscussed: "Business Laptop Pro",
    dealValue: "$7,799.94",
    messages: [
      {
        id: 1,
        sender: "bot" as const,
        content: "Hello Thomas! I see you're looking at our Business Laptop Pro models. How can I help you today?",
        timestamp: "2:15 PM"
      },
      {
        id: 2,
        sender: "customer" as const,
        content: "Hi, we need to purchase laptops for our sales team. I'm evaluating options for about 6 people.",
        timestamp: "2:18 PM"
      },
    ]
  },
  {
    id: 5,
    agentName: "Agent Beta",
    customerName: "James Wilson",
    date: "May 17, 2025",
    status: "no-interest" as const,
    productDiscussed: "Smart Office Bundle",
    messages: [
      {
        id: 1,
        sender: "bot" as const,
        content: "Hello James! I notice you're exploring our Smart Office Bundle. How can I assist you today?",
        timestamp: "10:05 AM"
      },
      {
        id: 2,
        sender: "customer" as const,
        content: "I'm just looking. What exactly does the Smart Office Bundle include?",
        timestamp: "10:07 AM"
      },
    ]
  },
];

const ChatLogs = () => {
  const [chatLogs, setChatLogs] = useState(initialChatLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  
  // Extract unique agents for filtering
  const agents = ['all', ...new Set(chatLogs.map(log => log.agentName))];
  
  // Apply filters
  const filteredLogs = chatLogs.filter(log => {
    const matchesSearch = log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.productDiscussed?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || log.agentName === agentFilter;
    
    return matchesSearch && matchesStatus && matchesAgent;
  });
  
  return (
    <div className="crm-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Chat Logs</h1>
          <p className="text-muted-foreground mt-1">Review conversations between AI agents and customers</p>
        </div>
        <Button>Export Logs</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search by customer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new-lead">New Lead</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="closed">Closed Won</SelectItem>
            <SelectItem value="no-interest">No Interest</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map(agent => (
              <SelectItem key={agent} value={agent}>
                {agent === 'all' ? 'All Agents' : agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-6">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <ChatLogViewer key={log.id} chatLog={log} />
          ))
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No chat logs match the current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLogs;
