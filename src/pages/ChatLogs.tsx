
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Search, Send, Bot, User } from 'lucide-react';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'closed': return 'bg-green-500';
    case 'interested': return 'bg-blue-500';
    case 'new-lead': return 'bg-yellow-500';
    case 'no-interest': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'closed': return 'Closed Won';
    case 'interested': return 'Interested';
    case 'new-lead': return 'New Lead';
    case 'no-interest': return 'No Interest';
    default: return status;
  }
};

const ChatLogs = () => {
  const [chatLogs, setChatLogs] = useState(initialChatLogs);
  const [selectedChat, setSelectedChat] = useState(initialChatLogs[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // Apply search filter
  const filteredLogs = chatLogs.filter(log => 
    log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.productDiscussed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = () => {
    const newChatId = Math.max(...chatLogs.map(c => c.id)) + 1;
    const newChat = {
      id: newChatId,
      agentName: "Agent Alpha",
      customerName: "New Customer",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "new-lead" as const,
      productDiscussed: "",
      messages: []
    };
    setChatLogs([newChat, ...chatLogs]);
    setSelectedChat(newChat);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const newMsg = {
      id: Math.max(...selectedChat.messages.map(m => m.id), 0) + 1,
      sender: "bot" as const,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMsg]
    };

    const updatedChatLogs = chatLogs.map(log => 
      log.id === selectedChat.id ? updatedChat : log
    );

    setChatLogs(updatedChatLogs);
    setSelectedChat(updatedChat);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">Chat Logs</h1>
          <p className="text-sm text-muted-foreground">Review and manage conversations</p>
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

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Chat List Panel */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {filteredLogs.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {chat.customerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{chat.customerName}</h3>
                          <span className="text-xs text-muted-foreground">{chat.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.messages[chat.messages.length - 1]?.content || 'No messages yet'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className={`${getStatusColor(chat.status)} text-white text-xs`}>
                            {getStatusText(chat.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{chat.agentName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Chat Detail Panel */}
        <ResizablePanel defaultSize={65}>
          {selectedChat ? (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedChat.customerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-semibold">{selectedChat.customerName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.productDiscussed || 'Product not specified'} • {selectedChat.agentName}
                    </p>
                  </div>
                  <Badge variant="secondary" className={`${getStatusColor(selectedChat.status)} text-white`}>
                    {getStatusText(selectedChat.status)}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[70%] ${
                        message.sender === 'customer' ? 'flex-row-reverse' : ''
                      }`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.sender === 'bot' ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg p-3 ${
                          message.sender === 'bot' 
                            ? 'bg-muted text-foreground' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a chat from the list to view the conversation</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatLogs;
