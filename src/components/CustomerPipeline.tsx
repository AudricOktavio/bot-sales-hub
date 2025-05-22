
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import StatusBadge from './common/StatusBadge';

// Define the stages of the sales pipeline
const pipelineStages = ['new', 'contacted', 'interested', 'closed'] as const;
type PipelineStage = typeof pipelineStages[number];

// Interface for customer data
interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: PipelineStage;
  lastActivity?: string;
  value?: string;
  assignedAgent?: string;
}

interface CustomerPipelineProps {
  customers: Customer[];
  onStatusChange: (customerId: number, newStatus: PipelineStage) => void;
  onSelectCustomer: (customer: Customer) => void;
}

const stageLabels = {
  new: 'New Leads',
  contacted: 'Contacted',
  interested: 'Interested',
  closed: 'Closed Won',
};

const CustomerPipeline = ({ customers, onStatusChange, onSelectCustomer }: CustomerPipelineProps) => {
  const [draggedCustomerId, setDraggedCustomerId] = useState<number | null>(null);
  
  // Group customers by their pipeline stage
  const customersByStage = pipelineStages.reduce((acc, stage) => {
    acc[stage] = customers.filter(customer => customer.status === stage);
    return acc;
  }, {} as Record<PipelineStage, Customer[]>);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, customerId: number) => {
    setDraggedCustomerId(customerId);
    e.dataTransfer.setData('text/plain', customerId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: PipelineStage) => {
    e.preventDefault();
    
    if (draggedCustomerId !== null) {
      onStatusChange(draggedCustomerId, targetStage);
      setDraggedCustomerId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {pipelineStages.map(stage => (
        <div 
          key={stage}
          className="flex flex-col h-full"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h3 className="font-medium">{stageLabels[stage]}</h3>
              <div className="ml-2 bg-muted text-muted-foreground text-xs rounded px-2 py-0.5">
                {customersByStage[stage].length}
              </div>
            </div>
            <StatusBadge status={stage} />
          </div>
          
          <div className="flex-1 space-y-3 min-h-[300px]">
            {customersByStage[stage].length === 0 ? (
              <div className="border border-dashed rounded-lg h-full min-h-[100px] flex items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">No customers in this stage</p>
              </div>
            ) : (
              customersByStage[stage].map(customer => (
                <Card
                  key={customer.id}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, customer.id)}
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{customer.company}</div>
                  {customer.value && stage === 'closed' && (
                    <div className="text-sm font-medium text-crm-closed mt-1">{customer.value}</div>
                  )}
                  {customer.assignedAgent && (
                    <div className="text-xs text-muted-foreground mt-1">Agent: {customer.assignedAgent}</div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerPipeline;
