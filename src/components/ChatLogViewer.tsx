
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import StatusBadge from './common/StatusBadge';

interface Message {
  id: number;
  content: string;
  sender: 'bot' | 'customer';
  timestamp: string;
}

interface ChatLog {
  id: number;
  agentName: string;
  customerName: string;
  messages: Message[];
  date: string;
  status: 'new-lead' | 'contacted' | 'interested' | 'closed' | 'no-interest';
  productDiscussed?: string;
  dealValue?: string;
}

interface ChatLogViewerProps {
  chatLog: ChatLog;
}

const statusLabels = {
  'new-lead': 'New Lead',
  'contacted': 'Contacted',
  'interested': 'Interested',
  'closed': 'Closed Won',
  'no-interest': 'No Interest'
};

const ChatLogViewer = ({ chatLog }: ChatLogViewerProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const previewMessages = chatLog.messages.slice(0, 3);
  const displayMessages = expanded ? chatLog.messages : previewMessages;
  const hasMoreMessages = chatLog.messages.length > previewMessages.length;
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="font-medium">{chatLog.customerName}</div>
          <div className="text-xs text-muted-foreground">
            With {chatLog.agentName} · {chatLog.date}
          </div>
        </div>
        <StatusBadge status={chatLog.status as any} label={statusLabels[chatLog.status]} />
      </div>
      
      <div className="p-4 space-y-4">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'bot'
                  ? 'bg-muted'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === 'bot'
                    ? 'text-muted-foreground'
                    : 'text-primary-foreground/80'
                }`}
              >
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {hasMoreMessages && !expanded && (
          <div className="text-center pt-2">
            <button
              onClick={() => setExpanded(true)}
              className="text-sm text-primary hover:underline"
            >
              Show {chatLog.messages.length - previewMessages.length} more messages
            </button>
          </div>
        )}
        
        {(chatLog.status === 'closed' || chatLog.productDiscussed) && (
          <div className="pt-4 mt-4 border-t">
            {chatLog.productDiscussed && (
              <div className="text-sm">
                <span className="text-muted-foreground">Product:</span>{' '}
                <span className="font-medium">{chatLog.productDiscussed}</span>
              </div>
            )}
            
            {chatLog.status === 'closed' && chatLog.dealValue && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Deal Value:</span>{' '}
                <span className="font-medium text-crm-closed">{chatLog.dealValue}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatLogViewer;
