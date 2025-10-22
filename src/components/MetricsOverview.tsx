import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import DashboardCard from './common/DashboardCard';
import api from '@/lib/api';
import { getApiUrl } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface ConversionSummary {
  start_date: string;
  end_date: string;
  total_leads: number;
  total_conversions: number;
  conversion_rate_percent: number;
  total_order_amount: number;
}

interface DailyConversion {
  date: string;
  total_leads: number;
  total_conversions: number;
  conversion_rate_percent: number;
  total_order_amount: number;
}

interface Agent {
  agent_id: number;
  agent_name: string;
  agent_type: string;
  is_active: boolean;
}

interface MetricsOverviewProps {
  startDate: Date;
  endDate: Date;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
}

const MetricCard = ({ title, value, trend, trendUp, subtitle, icon }: MetricCardProps) => (
  <div className="crm-card">
    <div className="flex justify-between items-center">
      <p className="text-muted-foreground text-sm">{title}</p>
      {icon && <div className="text-muted-foreground">{icon}</div>}
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    {trend && (
      <div className="flex items-center mt-2">
        <span
          className={`inline-block mr-1 text-xs ${
            trendUp ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </div>
    )}
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

const MetricsOverview = ({ startDate, endDate }: MetricsOverviewProps) => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<ConversionSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyConversion[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        // Fetch summary for selected date range
        const summaryUrl = getApiUrl('ANALYTICS_SUMMARY', formatDate(startDate), formatDate(endDate));
        const summaryRes = await api.get<ConversionSummary>(summaryUrl);
        setSummary(summaryRes.data);

        // Fetch daily data
        const dailyUrl = getApiUrl('ANALYTICS_DAILY');
        const dailyRes = await api.get<DailyConversion[]>(dailyUrl);
        setDailyData(dailyRes.data);

        // Fetch agents
        const agentsUrl = getApiUrl('AGENTS');
        const agentsRes = await api.get<Agent[]>(agentsUrl);
        setAgents(agentsRes.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate, toast]);

  // Transform daily data for chart
  const chartData = dailyData.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    leads: day.total_leads,
    conversions: day.total_conversions,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={loading ? "..." : summary?.total_leads.toString() || "0"}
          subtitle="This week"
        />
        <MetricCard
          title="Conversion Rate"
          value={loading ? "..." : `${summary?.conversion_rate_percent.toFixed(1) || 0}%`}
          subtitle="This week"
        />
        <MetricCard
          title="Active AI Agents"
          value={loading ? "..." : agents.filter(a => a.is_active).length.toString()}
          subtitle={`${agents.length} total agents`}
        />
        <MetricCard
          title="Total Sales"
          value={loading ? "..." : `$${summary?.total_order_amount.toFixed(2) || 0}`}
          subtitle={`${summary?.total_conversions || 0} conversions this week`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Sales Performance" subtitle="This week">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill="#7e4ff3" />
                <Bar dataKey="conversions" name="Conversions" fill="#30c9c6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Pipeline Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">New Leads</h4>
                <p className="text-sm text-muted-foreground">Uncontacted prospects</p>
              </div>
              <div className="bg-crm-new rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                48
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Contacted</h4>
                <p className="text-sm text-muted-foreground">Initial outreach made</p>
              </div>
              <div className="bg-crm-contacted rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                76
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Interested</h4>
                <p className="text-sm text-muted-foreground">Showing buying signals</p>
              </div>
              <div className="bg-crm-interested rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                29
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Closed</h4>
                <p className="text-sm text-muted-foreground">Deals won</p>
              </div>
              <div className="bg-crm-closed rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                18
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default MetricsOverview;
