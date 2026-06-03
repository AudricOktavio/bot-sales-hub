import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { API_CONFIG } from "@/config/api";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceResponse {
  success: boolean;
  message: string;
  balance: number;
  tier: string;
}

const Billing = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("");

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await api.get<BalanceResponse>(API_CONFIG.ENDPOINTS.CREDIT_BALANCE);
      setBalance(res.data.balance);
      setTier(res.data.tier);
    } catch (err: any) {
      toast({
        title: "Failed to load balance",
        description: err?.response?.data?.detail || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Credits & Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor your usage and manage your subscription
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Balance
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-3xl font-bold">
                {balance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "—"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Available credits for AI agent usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Plan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1 capitalize">
                  {tier || "—"}
                </Badge>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Your active subscription tier
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing
          </CardTitle>
          <CardDescription>
            Manage your subscription and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={fetchBalance} variant="outline">
              Refresh Balance
            </Button>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;