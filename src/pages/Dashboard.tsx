import { useState } from 'react';
import MetricsOverview from '@/components/MetricsOverview';
import DashboardCard from '@/components/common/DashboardCard';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Demo data
const topAgents = [
  { id: 1, name: 'Agent Alpha', sales: '$12,450', leadsGenerated: 42, conversionRate: '28.5%', status: 'active' },
  { id: 2, name: 'Agent Beta', sales: '$9,270', leadsGenerated: 38, conversionRate: '23.7%', status: 'active' },
  { id: 3, name: 'Agent Gamma', sales: '$6,810', leadsGenerated: 27, conversionRate: '19.2%', status: 'active' },
];

const recentLeads = [
  { id: 1, name: 'Sarah Johnson', company: 'Acme Co.', date: '2 hours ago', status: 'new', email: 'sarah@acme.co' },
  { id: 2, name: 'Michael Wong', company: 'TechGiant Inc.', date: '5 hours ago', status: 'contacted', email: 'michael@techgiant.com' },
  { id: 3, name: 'Elena Rodriguez', company: 'StartUp Ltd.', date: '1 day ago', status: 'interested', email: 'elena@startup.co' },
];

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 1); // Monday this week
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  return (
    <div className="crm-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(endDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <MetricsOverview startDate={startDate} endDate={endDate} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <DashboardCard 
          title="Top Performing AI Agents" 
          subtitle="Based on monthly sales"
          footer={<Button variant="outline" className="w-full">View All Agents</Button>}
        >
          <div className="divide-y">
            {topAgents.map((agent) => (
              <div key={agent.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {agent.leadsGenerated} leads · {agent.conversionRate} conv. rate
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-medium">{agent.sales}</div>
                  <StatusBadge status={agent.status as any} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Recent Leads" 
          subtitle="Generated in the last 7 days"
          footer={<Button variant="outline" className="w-full">View All Leads</Button>}
        >
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{lead.name}</div>
                  <StatusBadge status={lead.status as any} />
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-sm text-muted-foreground">
                    {lead.company} · {lead.email}
                  </div>
                  <div className="text-xs text-muted-foreground">{lead.date}</div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="mt-8">
        <DashboardCard 
          title="Recent Activity" 
          subtitle="System and user activities"
        >
          <div className="space-y-4">
            <div className="border-l-2 border-crm-primary pl-4 pb-5 relative">
              <div className="absolute w-3 h-3 bg-crm-primary rounded-full -left-[7px] top-0"></div>
              <div className="text-sm font-medium">Agent Beta closed a deal with TechGiant Inc.</div>
              <div className="text-xs text-muted-foreground mt-1">Value: $4,200 · 2 hours ago</div>
            </div>
            <div className="border-l-2 border-crm-secondary pl-4 pb-5 relative">
              <div className="absolute w-3 h-3 bg-crm-secondary rounded-full -left-[7px] top-0"></div>
              <div className="text-sm font-medium">Agent Alpha generated 5 new leads</div>
              <div className="text-xs text-muted-foreground mt-1">From website chat · 4 hours ago</div>
            </div>
            <div className="border-l-2 border-crm-accent pl-4 pb-5 relative">
              <div className="absolute w-3 h-3 bg-crm-accent rounded-full -left-[7px] top-0"></div>
              <div className="text-sm font-medium">New AI Agent "Delta" was configured</div>
              <div className="text-xs text-muted-foreground mt-1">Ready to engage with customers · 8 hours ago</div>
            </div>
            <div className="border-l-2 border-crm-new pl-4 relative">
              <div className="absolute w-3 h-3 bg-crm-new rounded-full -left-[7px] top-0"></div>
              <div className="text-sm font-medium">10 products were added to the catalog</div>
              <div className="text-xs text-muted-foreground mt-1">Via CSV import · 1 day ago</div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;
