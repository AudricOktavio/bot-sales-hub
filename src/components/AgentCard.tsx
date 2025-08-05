
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2, List, MessageCircle } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface AgentCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  leadsGenerated?: number;
  conversionRate?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onChat?: (id: number) => void;
}

const AgentCard = ({
  id,
  name,
  description,
  category,
  status,
  leadsGenerated = 0,
  conversionRate = '0%',
  onEdit,
  onDelete,
  onChat,
}: AgentCardProps) => {
  const [active, setActive] = useState(status === 'active');
  const { toast } = useToast();

  const handleStatusChange = (checked: boolean) => {
    setActive(checked);
    toast({
      title: checked ? "Agent Activated" : "Agent Deactivated",
      description: `${name} is now ${checked ? 'active' : 'inactive'}`,
    });
  };

  return (
    <div className="crm-card">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-medium">{name}</h3>
            <Badge variant="outline" className="ml-2">
              {category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={active} 
            onCheckedChange={handleStatusChange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onChat?.(id)}>
                <MessageCircle className="mr-2 h-4 w-4" /> Test Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {(leadsGenerated > 0 || conversionRate !== '0%') && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-muted-foreground">Leads:</span>{" "}
              <span className="font-medium">{leadsGenerated}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Conversion:</span>{" "}
              <span className="font-medium">{conversionRate}</span>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      )}
      {(leadsGenerated === 0 && conversionRate === '0%') && (
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">No activity yet</div>
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
};

export default AgentCard;
