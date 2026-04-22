import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import DashboardCard from "./common/DashboardCard";
import api from "@/lib/api";
import { API_CONFIG } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ContactStatusStats {
  new: number;
  contacted: number;
  interested: number;
  closed: number;
}

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

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
}

type MetricsOverviewProps = {
  startDate?: Date;
  endDate?: Date;
};

const MetricCard = ({
  title,
  value,
  trend,
  trendUp,
  subtitle,
  icon,
}: MetricCardProps) => (
  // Added 'flex flex-col items-center justify-center text-center'
  <div className="crm-card flex flex-col items-center justify-center text-center min-h-[140px]">
    <div className="flex items-center gap-2">
      <p className="text-muted-foreground text-sm">{title}</p>
      {icon && <div className="text-muted-foreground">{icon}</div>}
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    {trend && (
      // Added 'justify-center' to keep the trend row centered
      <div className="flex items-center justify-center mt-2">
        <span
          className={`inline-block mr-1 text-xs ${
            trendUp ? "text-green-500" : "text-red-500"
          }`}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </span>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </div>
    )}
    {subtitle && (
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    )}
  </div>
);

// ✅ FIX: Monday this week (safe for Sunday)
function getDefaultStartOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);

  const day = date.getDay(); // Sun=0
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return date;
}

function normalizeDateRange(start: Date, end: Date) {
  const s = new Date(start);
  const e = new Date(end);

  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  if (s.getTime() > e.getTime()) {
    return { start: e, end: s, swapped: true };
  }
  return { start: s, end: e, swapped: false };
}

function fmtLocalYYYYMMDD(d: Date) {
  return format(d, "yyyy-MM-dd");
}

const MetricsOverview = ({ startDate, endDate }: MetricsOverviewProps) => {
  const { toast } = useToast();

  const [summary, setSummary] = useState<ConversionSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyConversion[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusStats, setStatusStats] = useState<ContactStatusStats | null>(null);

  const resolvedStartDate = useMemo(() => {
    return startDate ? new Date(startDate) : getDefaultStartOfWeek(new Date());
  }, [startDate]);

  const resolvedEndDate = useMemo(() => {
    const d = endDate ? new Date(endDate) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [endDate]);

  const normalizedRange = useMemo(() => {
    return normalizeDateRange(resolvedStartDate, resolvedEndDate);
  }, [resolvedStartDate, resolvedEndDate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        const { start, end } = normalizedRange;

        const startStr = fmtLocalYYYYMMDD(start);
        const endStr = fmtLocalYYYYMMDD(end);

        // existing calls
        const summaryPath = API_CONFIG.ENDPOINTS.ANALYTICS_SUMMARY(
          startStr,
          endStr
        );

        const summaryRes = await api.get<ConversionSummary>(summaryPath);
        setSummary(summaryRes.data);

        const dailyPath = API_CONFIG.ENDPOINTS.ANALYTICS_DAILY;
        const dailyRes = await api.get<DailyConversion[]>(dailyPath);
        setDailyData(dailyRes.data);

        const statsRes = await api.get<ContactStatusStats>(
          API_CONFIG.ENDPOINTS.CONTACT_STATS_STATUS
        );

        setStatusStats(statsRes.data);
      } catch (error: any) {
        const detail =
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch analytics data";

        toast({
          title: "Error",
          description: String(detail),
          variant: "destructive",
        });

        setSummary(null);
        setDailyData([]);
        setStatusStats(null); // ✅ reset
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [normalizedRange, toast]);

  const chartData = dailyData.map((day) => ({
    name: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    leads: day.total_leads,
    conversions: day.total_conversions,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Leads"
          value={loading ? "..." : summary?.total_leads?.toString() || "0"}
          subtitle="Selected range"
        />
        <MetricCard
          title="Conversion Rate"
          value={
            loading
              ? "..."
              : `${(summary?.conversion_rate_percent ?? 0).toFixed(1)}%`
          }
          subtitle="Selected range"
        />
        {/* <MetricCard
          title="Active AI Agents"
          value="8"
          subtitle="2 pending setup"
        /> */}
        <MetricCard
          title="Total Sales"
          value={
            loading
              ? "..."
              : `Rp.${(summary?.total_order_amount ?? 0).toFixed(2)}`
          }
          subtitle={`${summary?.total_conversions ?? 0} conversions`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Sales Performance" subtitle="Selected range">
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
                <p className="text-sm text-muted-foreground">
                  Uncontacted prospects
                </p>
              </div>
              <div className="bg-crm-new rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                {loading ? "..." : statusStats?.new ?? 0}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Contacted</h4>
                <p className="text-sm text-muted-foreground">
                  Initial outreach made
                </p>
              </div>
              <div className="bg-crm-contacted rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                {loading ? "..." : statusStats?.contacted ?? 0}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Interested</h4>
                <p className="text-sm text-muted-foreground">
                  Showing buying signals
                </p>
              </div>
              <div className="bg-crm-interested rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                {loading ? "..." : statusStats?.interested ?? 0}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Closed</h4>
                <p className="text-sm text-muted-foreground">Deals won</p>
              </div>
              <div className="bg-crm-closed rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                {loading ? "..." : statusStats?.closed ?? 0}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default MetricsOverview;
