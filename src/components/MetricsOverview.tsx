
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import DashboardCard from './common/DashboardCard';

// Demo data for metrics
const salesData = [
  { name: 'Mon', leads: 12, sales: 4 },
  { name: 'Tue', leads: 14, sales: 6 },
  { name: 'Wed', leads: 10, sales: 2 },
  { name: 'Thu', leads: 18, sales: 9 },
  { name: 'Fri', leads: 24, sales: 12 },
  { name: 'Sat', leads: 8, sales: 3 },
  { name: 'Sun', leads: 6, sales: 1 },
];

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

const MetricsOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value="324"
          trend="12%"
          trendUp={true}
          subtitle="92 new this week"
        />
        <MetricCard
          title="Conversion Rate"
          value="24.8%"
          trend="3.2%"
          trendUp={true}
          subtitle="From website visitors"
        />
        <MetricCard
          title="Active AI Agents"
          value="8"
          subtitle="2 pending setup"
        />
        <MetricCard
          title="Deals Closed"
          value="$34,590"
          trend="8.5%"
          trendUp={false}
          subtitle="18 deals this month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Sales Performance" subtitle="Last 7 days">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill="#7e4ff3" />
                <Bar dataKey="sales" name="Sales" fill="#30c9c6" />
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
