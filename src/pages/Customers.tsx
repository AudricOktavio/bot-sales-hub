
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CustomerPipeline from '@/components/CustomerPipeline';
import StatusBadge from '@/components/common/StatusBadge';

// Demo data
const initialCustomers = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Acme Co.",
    email: "sarah@acme.co",
    phone: "(555) 123-4567",
    status: "new" as const,
    lastActivity: "2 hours ago",
    assignedAgent: "Agent Alpha",
  },
  {
    id: 2,
    name: "Michael Wong",
    company: "TechGiant Inc.",
    email: "michael@techgiant.com",
    phone: "(555) 987-6543",
    status: "contacted" as const,
    lastActivity: "5 hours ago",
    assignedAgent: "Agent Beta",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    company: "StartUp Ltd.",
    email: "elena@startup.co",
    phone: "(555) 321-7890",
    status: "interested" as const,
    lastActivity: "1 day ago",
    assignedAgent: "Agent Alpha",
  },
  {
    id: 4,
    name: "James Wilson",
    company: "Enterprise Solutions",
    email: "james@enterprise.com",
    phone: "(555) 789-0123",
    status: "closed" as const,
    lastActivity: "2 days ago",
    value: "$4,500",
    assignedAgent: "Agent Beta",
  },
  {
    id: 5,
    name: "Linda Martinez",
    company: "Global Services",
    email: "linda@global.com",
    phone: "(555) 456-7890",
    status: "new" as const,
    lastActivity: "3 hours ago",
    assignedAgent: "Agent Gamma",
  },
  {
    id: 6,
    name: "Robert Kim",
    company: "Innovative Tech",
    email: "robert@innovative.com",
    phone: "(555) 234-5678",
    status: "contacted" as const,
    lastActivity: "8 hours ago",
    assignedAgent: "Agent Alpha",
  },
  {
    id: 7,
    name: "Patricia Lee",
    company: "Dynamic Solutions",
    email: "patricia@dynamic.com",
    phone: "(555) 876-5432",
    status: "interested" as const,
    lastActivity: "4 hours ago",
    assignedAgent: "Agent Gamma",
  },
  {
    id: 8,
    name: "Thomas Brown",
    company: "Advanced Tech",
    email: "thomas@advancedtech.com",
    phone: "(555) 567-8901",
    status: "closed" as const,
    lastActivity: "3 days ago",
    value: "$7,200",
    assignedAgent: "Agent Beta",
  },
];

const chatHistory = [
  {
    id: 1,
    customerId: 2,
    messages: [
      { sender: "Agent", text: "Hello Michael, I noticed you've been looking at our cloud services. How can I assist you today?", timestamp: "10:32 AM" },
      { sender: "Customer", text: "Hi, yes I'm interested in your enterprise solution but I have some questions about the pricing.", timestamp: "10:35 AM" },
      { sender: "Agent", text: "I'd be happy to help with that. Our enterprise plans start at $499/month and include up to 10 users. What size is your team?", timestamp: "10:36 AM" },
      { sender: "Customer", text: "We have about 25 users currently, but might expand to 40 in the next six months.", timestamp: "10:38 AM" },
      { sender: "Agent", text: "In that case, our Premium plan at $999/month would be most suitable, as it covers up to 50 users and includes priority support. Would you like me to send over a detailed quote?", timestamp: "10:40 AM" },
      { sender: "Customer", text: "Yes, that would be great. Could you also include information about your API integration options?", timestamp: "10:42 AM" },
    ]
  },
  {
    id: 2,
    customerId: 3,
    messages: [
      { sender: "Agent", text: "Hello Elena, I wanted to follow up on our previous conversation about StartUp Ltd's needs for a CRM solution.", timestamp: "9:15 AM" },
      { sender: "Customer", text: "Thanks for reaching out. I discussed it with my team and we're definitely interested in moving forward.", timestamp: "9:20 AM" },
      { sender: "Agent", text: "That's great to hear! Would you like to schedule a demo with one of our technical specialists to see how our solution can be customized for your specific needs?", timestamp: "9:22 AM" },
      { sender: "Customer", text: "Yes, that would be helpful. How about next Tuesday at 2pm?", timestamp: "9:25 AM" },
    ]
  }
];

// Define Customer interface
interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: "new" | "contacted" | "interested" | "closed";
  lastActivity?: string;
  value?: string;
  assignedAgent?: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

interface ChatHistory {
  id: number;
  customerId: number;
  messages: ChatMessage[];
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pipeline');
  const { toast } = useToast();

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (customerId: number, newStatus: Customer["status"]) => {
    setCustomers(customers.map(customer => {
      if (customer.id === customerId) {
        const updatedCustomer = { ...customer, status: newStatus };
        return updatedCustomer;
      }
      return customer;
    }));
    
    toast({
      title: "Customer Status Updated",
      description: `Customer moved to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} stage`,
    });
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const getCustomerChat = (customerId: number): ChatHistory | undefined => {
    return chatHistory.find(chat => chat.customerId === customerId);
  };

  return (
    <div className="crm-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">Track leads and manage customer relationships</p>
        </div>
        <div className="flex gap-2">
          <Button>Add Customer</Button>
          <Button variant="outline">Import</Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <CustomerPipeline
            customers={filteredCustomers}
            onStatusChange={handleStatusChange}
            onSelectCustomer={handleSelectCustomer}
          />
        </TabsContent>

        <TabsContent value="list">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Customer</th>
                  <th className="py-3 px-4 text-left font-medium">Contact</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Agent</th>
                  <th className="py-3 px-4 text-left font-medium">Last Activity</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.company}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{customer.email}</div>
                      <div className="text-xs text-muted-foreground">{customer.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="py-3 px-4">{customer.assignedAgent}</td>
                    <td className="py-3 px-4">{customer.lastActivity}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => handleSelectCustomer(customer)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.company} · {selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <div><StatusBadge status={selectedCustomer?.status || 'new'} /></div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{selectedCustomer?.phone || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned Agent</p>
                <p>{selectedCustomer?.assignedAgent || 'None'}</p>
              </div>
              
              {selectedCustomer?.status === 'closed' && selectedCustomer?.value && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Deal Value</p>
                  <p className="text-lg font-medium text-crm-closed">{selectedCustomer.value}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Button className="w-full">Send Email</Button>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="font-medium">Conversation History</h3>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                  {selectedCustomer && getCustomerChat(selectedCustomer.id) ? (
                    getCustomerChat(selectedCustomer.id)?.messages.map((message, idx) => (
                      <div key={idx} className={`flex ${message.sender === 'Agent' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'Agent' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                          <div className="text-sm">{message.text}</div>
                          <div className={`text-xs mt-1 ${message.sender === 'Agent' ? 'text-muted-foreground' : 'text-primary-foreground/80'}`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      No conversation history available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
