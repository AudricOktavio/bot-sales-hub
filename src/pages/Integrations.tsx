import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  CreditCard,
  Database,
  MessageCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { API_CONFIG } from "@/config/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WhatsAppAccount {
  whatsapp_id: number;
  phone_number: string;
  phone_number_id: string;
  access_token: string;
  verify_token: string;
  agent_id: number;
}

interface AccurateProvider {
  provider_id: number;
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_at?: string;
  accurate_user_name?: string;
  accurate_user_email?: string;
  db_id?: number;
  db_alias?: string;
  host?: string;
  session_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AccurateDatabase {
  id: number;
  alias?: string | null;
  name?: string | null;
  host?: string | null;
}

const Integrations = () => {
  const { toast } = useToast();

  // Midtrans settings
  const [midtransEnabled, setMidtransEnabled] = useState(false);
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [midtransClientKey, setMidtransClientKey] = useState("");
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false);
  const [midtransExists, setMidtransExists] = useState(false);

  // WhatsApp settings - Multiple accounts
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  const [isWhatsappMethodDialogOpen, setIsWhatsappMethodDialogOpen] = useState(false);
  const [editingWhatsapp, setEditingWhatsapp] = useState<WhatsAppAccount | null>(null);
  const [whatsappForm, setWhatsappForm] = useState({
    phone_number: "",
    phone_number_id: "",
    access_token: "",
    verify_token: "",
    agent_id: "" as number | "",
  });
  const [showWhatsappApiToken, setShowWhatsappApiToken] = useState(false);
  const [showWhatsappVerifyToken, setShowWhatsappVerifyToken] = useState(false);
  const [agents, setAgents] = useState<Array<{ agent_id: number; agent_name: string }>>([]);

  // ERP Selection
  const [erpChoice, setErpChoice] = useState<"none" | "sap" | "odoo" | "accurate">("none");

  // Accurate ERP/WMS
  const [accurateProvider, setAccurateProvider] = useState<AccurateProvider | null>(null);
  const [accurateLoading, setAccurateLoading] = useState(false);
  const [accurateError, setAccurateError] = useState<string | null>(null);
  const [accurateDatabases, setAccurateDatabases] = useState<AccurateDatabase[]>([]);
  const [accurateDbLoading, setAccurateDbLoading] = useState(false);
  const [selectedAccurateDbId, setSelectedAccurateDbId] = useState<string>("");

  // SAP B1 settings
  const [sapEnabled, setSapEnabled] = useState(false);
  const [sapExists, setSapExists] = useState(false);
  const [sapBaseUrl, setSapBaseUrl] = useState("");
  const [sapCompanyDb, setSapCompanyDb] = useState("");
  const [sapUsername, setSapUsername] = useState("");
  const [sapPassword, setSapPassword] = useState("");
  const [sapPort, setSapPort] = useState("");
  const [showSapPassword, setShowSapPassword] = useState(false);

  // Odoo settings
  const [odooEnabled, setOdooEnabled] = useState(false);
  const [odooExists, setOdooExists] = useState(false);
  const [odooUrl, setOdooUrl] = useState("");
  const [odooDatabase, setOdooDatabase] = useState("");
  const [odooUsername, setOdooUsername] = useState("");
  const [odooPassword, setOdooPassword] = useState("");
  const [showOdooPassword, setShowOdooPassword] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchAll = async () => {
      const headers = getAuthHeaders();
      try {
        const [agentsRes, paymentRes, whatsRes, sapRes, odooRes, accurateRes] = await Promise.allSettled([
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_PROVIDER}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPPS}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAP_PROVIDER}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ODOO_PROVIDER}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_PROVIDER}`, { headers }),
        ]);

        let detectedErpChoice: typeof erpChoice = "none";

        if (agentsRes.status === "fulfilled") {
          setAgents(agentsRes.value.data || []);
        }

        if (paymentRes.status === "fulfilled") {
          const p = paymentRes.value.data;
          setMidtransEnabled(!!p?.is_active);
          setMidtransServerKey(p?.server_key || "");
          setMidtransClientKey(p?.client_key || "");
          setMidtransExists(true);
        } else {
          setMidtransExists(false);
        }

        if (whatsRes.status === "fulfilled") {
          const list = whatsRes.value.data || [];
          setWhatsappAccounts(list);
        }

        // SAP status
        if (sapRes.status === "fulfilled") {
          const s = sapRes.value.data;
          setSapEnabled(!!s?.is_active);
          setSapExists(!!s?.is_active);
          setSapBaseUrl(s?.base_url || "");
          setSapCompanyDb(s?.company_db || "");
          setSapUsername(s?.username || "");
          setSapPassword(s?.password || "");
          setSapPort(s?.port || "");
          if (s?.is_active) detectedErpChoice = "sap";
        } else {
          setSapEnabled(false);
          setSapExists(false);
        }

        // Odoo status
        if (odooRes.status === "fulfilled") {
          const o = odooRes.value.data;
          setOdooEnabled(!!o?.is_active);
          setOdooExists(true);
          setOdooUrl(o?.base_url || "");
          setOdooDatabase(o?.company_db || "");
          setOdooUsername(o?.username || "");
          setOdooPassword(o?.password || "");
          if (o?.is_active) detectedErpChoice = "odoo";
        } else {
          setOdooEnabled(false);
          setOdooExists(false);
        }

        // Accurate status
        if (accurateRes.status === "fulfilled") {
          const a = accurateRes.value.data;
          setAccurateProvider(a);
          setAccurateError(null);
          if (a?.db_id) setSelectedAccurateDbId(String(a.db_id));
          if (a?.is_active) detectedErpChoice = "accurate";
        } else {
          setAccurateProvider(null);
          setAccurateError(null);
        }

        setErpChoice(detectedErpChoice);
      } catch (error) {
        console.error("Integrations init error:", error);
      }
    };
    fetchAll();
  }, []);

  // Midtrans toggle logic
  const prevMidtransEnabled = useRef(midtransEnabled);
  useEffect(() => {
    const run = async () => {
      if (prevMidtransEnabled.current && !midtransEnabled && midtransExists) {
        try {
          const headers = getAuthHeaders();
          await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_PROVIDER}`, { headers });
          setMidtransExists(false);
          setMidtransServerKey("");
          setMidtransClientKey("");
          toast({ title: "Midtrans Disabled", description: "Payment provider removed." });
        } catch (error: any) {
          console.error("Midtrans disable error:", error);
          toast({
            title: "Failed to disable Midtrans",
            description: error?.response?.data?.message || "An error occurred.",
            variant: "destructive",
          });
          setMidtransEnabled(true);
        }
      }
      prevMidtransEnabled.current = midtransEnabled;
    };
    run();
  }, [midtransEnabled, midtransExists]);

  // SAP toggle logic
  const prevSapEnabled = useRef(sapEnabled);
  useEffect(() => {
    const run = async () => {
      if (prevSapEnabled.current && !sapEnabled && sapExists) {
        try {
          const headers = getAuthHeaders();
          await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAP_PROVIDER}`, { headers });
          setSapExists(false);
          setSapBaseUrl("");
          setSapCompanyDb("");
          setSapUsername("");
          setSapPassword("");
          setSapPort("");
          setErpChoice("none");
          toast({ title: "SAP Disabled", description: "SAP integration removed." });
        } catch (error: any) {
          console.error("SAP disable error:", error);
          toast({
            title: "Failed to disable SAP",
            description: error?.response?.data?.message || "An error occurred.",
            variant: "destructive",
          });
          setSapEnabled(true);
        }
      }
      prevSapEnabled.current = sapEnabled;
    };
    run();
  }, [sapEnabled, sapExists]);

  // Odoo toggle logic
  const prevOdooEnabled = useRef(odooEnabled);
  useEffect(() => {
    const run = async () => {
      if (prevOdooEnabled.current && !odooEnabled && odooExists) {
        try {
          const headers = getAuthHeaders();
          await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ODOO_PROVIDER}`, { headers });
          setOdooExists(false);
          setOdooUrl("");
          setOdooDatabase("");
          setOdooUsername("");
          setOdooPassword("");
          setErpChoice("none");
          toast({ title: "Odoo Disabled", description: "Odoo integration removed." });
        } catch (error: any) {
          console.error("Odoo disable error:", error);
          toast({
            title: "Failed to disable Odoo",
            description: error?.response?.data?.message || "An error occurred.",
            variant: "destructive",
          });
          setOdooEnabled(true);
        }
      }
      prevOdooEnabled.current = odooEnabled;
    };
    run();
  }, [odooEnabled, odooExists]);

  const handleMidtransSave = async () => {
    if (!midtransServerKey || !midtransClientKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in both server key and client key",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_PROVIDER}`,
        {
          provider_name: "Midtrans",
          server_key: midtransServerKey,
          client_key: midtransClientKey,
          is_active: midtransEnabled,
        },
        { headers }
      );

      setMidtransExists(true);
      toast({
        title: "Midtrans Settings Saved",
        description: "Payment gateway configuration has been updated",
      });
    } catch (error: any) {
      console.error("Midtrans Save Error:", error);
      toast({
        title: "Failed to Save Midtrans Settings",
        description: error?.response?.data?.message || "An error occurred while saving Midtrans settings.",
        variant: "destructive",
      });
    }
  };

  const handleSapSave = async () => {
    if (!sapBaseUrl || !sapCompanyDb || !sapUsername || !sapPassword || !sapPort) {
      toast({
        title: "Missing Information",
        description: "Please fill in all SAP B1 connection details",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAP_PROVIDER}`,
        {
          provider_name: "SAP B1",
          base_url: sapBaseUrl,
          port: sapPort,
          company_db: sapCompanyDb,
          username: sapUsername,
          password: sapPassword,
          verify_ssl: false,
          is_active: sapEnabled,
        },
        { headers }
      );

      setSapExists(true);
      toast({
        title: "SAP B1 Settings Saved",
        description: "ERP integration configuration has been updated",
      });
    } catch (error: any) {
      console.error("SAP Save Error:", error);
      toast({
        title: "Failed to Save SAP Settings",
        description: error?.response?.data?.message || "An error occurred while saving SAP settings.",
        variant: "destructive",
      });
    }
  };

  const handleOdooSave = async () => {
    if (!odooUrl || !odooDatabase || !odooUsername || !odooPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all Odoo connection details",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ODOO_PROVIDER}`,
        {
          provider_name: "Odoo Integration",
          base_url: odooUrl,
          company_db: odooDatabase,
          username: odooUsername,
          password: odooPassword,
          verify_ssl: false,
          is_active: odooEnabled,
        },
        { headers }
      );

      setOdooExists(true);
      toast({
        title: "Odoo Settings Saved",
        description: "ERP integration configuration has been updated",
      });
    } catch (error: any) {
      console.error("Odoo Save Error:", error);
      toast({
        title: "Failed to Save Odoo Settings",
        description: error?.response?.data?.message || "An error occurred while saving Odoo settings.",
        variant: "destructive",
      });
    }
  };

  // WhatsApp Management
  const handleAddWhatsapp = () => {
    setIsWhatsappMethodDialogOpen(true);
  };

  const handleManualWhatsappInput = () => {
    setIsWhatsappMethodDialogOpen(false);
    setEditingWhatsapp(null);
    setWhatsappForm({
      phone_number: "",
      phone_number_id: "",
      access_token: "",
      verify_token: "",
      agent_id: "",
    });
    setIsWhatsappDialogOpen(true);
  };

  const handleWhatsappOAuthLogin = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP_OAUTH_LOGIN}`,
        { headers }
      );

      const authorizeUrl = res.data?.authorize_url;

      if (authorizeUrl && authorizeUrl.startsWith("http")) {
        window.location.href = authorizeUrl;
      } else {
        toast({
          title: "OAuth Error",
          description: "Backend did not return a valid authorize_url.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("WhatsApp OAuth error:", error);
      toast({
        title: "Failed to initiate WhatsApp OAuth",
        description: error?.response?.data?.detail || error?.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsWhatsappMethodDialogOpen(false);
    }
  };

  const handleEditWhatsapp = (account: WhatsAppAccount) => {
    setEditingWhatsapp(account);
    setWhatsappForm({
      phone_number: account.phone_number,
      phone_number_id: account.phone_number_id,
      access_token: account.access_token,
      verify_token: account.verify_token,
      agent_id: account.agent_id,
    });
    setIsWhatsappDialogOpen(true);
  };

  const handleSaveWhatsapp = async () => {
    if (
      !whatsappForm.phone_number ||
      !whatsappForm.phone_number_id ||
      !whatsappForm.access_token ||
      !whatsappForm.verify_token ||
      whatsappForm.agent_id === ""
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all WhatsApp Business API details and select an agent",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = getAuthHeaders();
      const payload = {
        phone_number: whatsappForm.phone_number,
        phone_number_id: whatsappForm.phone_number_id,
        access_token: whatsappForm.access_token,
        verify_token: whatsappForm.verify_token,
        agent_id: Number(whatsappForm.agent_id),
      };

      if (editingWhatsapp) {
        await axios.put(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP_BY_ID(editingWhatsapp.whatsapp_id)}`,
          payload,
          { headers }
        );
        toast({ title: "WhatsApp Updated", description: "WhatsApp account has been updated" });
      } else {
        await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPPS}`, payload, { headers });
        toast({ title: "WhatsApp Added", description: "WhatsApp account has been added" });
      }

      // Refresh WhatsApp accounts list
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPPS}`, { headers });
      setWhatsappAccounts(res.data || []);
      setIsWhatsappDialogOpen(false);
    } catch (error: any) {
      console.error("WhatsApp Save Error:", error);
      toast({
        title: "Failed to Save WhatsApp",
        description: error?.response?.data?.message || "An error occurred while saving WhatsApp settings.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWhatsapp = async (whatsappId: number) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP_BY_ID(whatsappId)}`, { headers });
      setWhatsappAccounts(whatsappAccounts.filter((w) => w.whatsapp_id !== whatsappId));
      toast({ title: "WhatsApp Deleted", description: "WhatsApp account has been removed" });
    } catch (error: any) {
      console.error("WhatsApp Delete Error:", error);
      toast({
        title: "Failed to Delete WhatsApp",
        description: error?.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAccurateConnect = async () => {
    const headers = getAuthHeaders();
    setAccurateError(null);

    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_CONNECT}`,
        { headers }
      );

      console.log("Accurate connect response:", res.data);

      const redirectUrl = res.data?.authorize_url;

      if (redirectUrl && redirectUrl.startsWith("http")) {
        // Full page navigation → no CORS issues
        window.location.href = redirectUrl;
      } else {
        setAccurateError("Backend did not return a valid authorize_url.");
      }
    } catch (error: any) {
      console.error("Accurate connect error:", error);
      setAccurateError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to initiate Accurate connection."
      );
    }
  };

  const handleAccurateRefresh = async () => {
    const headers = getAuthHeaders();
    setAccurateLoading(true);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_PROVIDER}`, { headers });
      setAccurateProvider(res.data);
      if (res.data?.db_id) setSelectedAccurateDbId(String(res.data.db_id));
      setAccurateError(null);
      if (res.data?.is_active) {
        setErpChoice("accurate");
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setAccurateProvider(null);
        setAccurateError("Not connected to Accurate yet.");
      } else {
        console.error("Accurate status error:", error);
        setAccurateError(
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "Unable to fetch Accurate status."
        );
      }
    } finally {
      setAccurateLoading(false);
    }
  };

  const handleAccurateListDatabases = async () => {
    const headers = getAuthHeaders();
    setAccurateDbLoading(true);
    setAccurateError(null);
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_DATABASES}`, { headers });
      setAccurateDatabases(res.data || []);
      if ((res.data || []).length === 1) {
        setSelectedAccurateDbId(String(res.data[0].id));
      }
    } catch (error: any) {
      console.error("Accurate list databases error:", error);
      setAccurateError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Unable to load Accurate databases."
      );
    } finally {
      setAccurateDbLoading(false);
    }
  };

  const handleAccurateOpenDatabase = async () => {
    if (!selectedAccurateDbId) {
      setAccurateError("Please select a database to open.");
      return;
    }
    const headers = getAuthHeaders();
    setAccurateLoading(true);
    try {
      const payload = {
        db_id: Number(selectedAccurateDbId),
        alias:
          accurateDatabases.find((db) => String(db.id) === selectedAccurateDbId)?.alias ||
          accurateDatabases.find((db) => String(db.id) === selectedAccurateDbId)?.name,
        host: accurateDatabases.find((db) => String(db.id) === selectedAccurateDbId)?.host,
      };
      const res = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_OPEN_DB}`,
        payload,
        { headers }
      );
      setAccurateProvider(res.data);
      if (res.data?.db_id) setSelectedAccurateDbId(String(res.data.db_id));
      setAccurateError(null);
      toast({ title: "Accurate database opened", description: payload.alias || `DB #${payload.db_id}` });
    } catch (error: any) {
      console.error("Accurate open database error:", error);
      setAccurateError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to open Accurate database."
      );
    } finally {
      setAccurateLoading(false);
    }
  };

  useEffect(() => {
    if (accurateProvider?.is_active && accurateDatabases.length === 0) {
      handleAccurateListDatabases();
    }
  }, [accurateProvider?.is_active]);

  const handleErpChoice = async (choice: "sap" | "odoo" | "accurate") => {
    // If switching from one ERP to another, disable the current one
    if (choice === "sap") {
      if (odooEnabled) setOdooEnabled(false);
      setErpChoice("sap");
      setSapEnabled(true);
    } else if (choice === "odoo") {
      if (sapEnabled) setSapEnabled(false);
      setErpChoice("odoo");
      setOdooEnabled(true);
    } else {
      if (sapEnabled) setSapEnabled(false);
      if (odooEnabled) setOdooEnabled(false);
      setErpChoice("accurate");
      setAccurateError(null);
    }
  };

  return (
    <div className="crm-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tools & Integrations</h1>
        <p className="text-muted-foreground mt-1">Configure third-party services and APIs</p>
      </div>

      <div className="space-y-8">
        {/* Payment Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Midtrans</CardTitle>
              <CardDescription>Configure Midtrans for payment processing in your sales flow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="midtrans-enabled" className="text-base font-medium">
                    Enable Midtrans Integration
                  </Label>
                  <p className="text-sm text-muted-foreground">Allow your AI agents to process payments through Midtrans</p>
                </div>
                <Switch id="midtrans-enabled" checked={midtransEnabled} onCheckedChange={setMidtransEnabled} />
              </div>

              {midtransEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="midtrans-server-key">Server Key</Label>
                    <div className="relative">
                      <Input
                        id="midtrans-server-key"
                        type={showMidtransServerKey ? "text" : "password"}
                        value={midtransServerKey}
                        onChange={(e) => setMidtransServerKey(e.target.value)}
                        placeholder="Enter your Midtrans server key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowMidtransServerKey(!showMidtransServerKey)}
                      >
                        {showMidtransServerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="midtrans-client-key">Client Key</Label>
                    <Input
                      id="midtrans-client-key"
                      value={midtransClientKey}
                      onChange={(e) => setMidtransClientKey(e.target.value)}
                      placeholder="Enter your Midtrans client key"
                    />
                  </div>

                  <Button onClick={handleMidtransSave} className="w-full">
                    Save Midtrans Configuration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Social Media Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Social & Messaging
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Meta WhatsApp Business</CardTitle>
              <CardDescription>Manage multiple WhatsApp Business API accounts for messaging capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">WhatsApp Accounts</p>
                  <p className="text-sm text-muted-foreground">{whatsappAccounts.length} account(s) configured</p>
                </div>
                <Button onClick={handleAddWhatsapp} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add WhatsApp
                </Button>
              </div>

              {whatsappAccounts.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Linked Agent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {whatsappAccounts.map((account) => (
                        <TableRow key={account.whatsapp_id}>
                          <TableCell className="font-medium">{account.phone_number}</TableCell>
                          <TableCell>
                            {agents.find((a) => a.agent_id === account.agent_id)?.agent_name || `Agent #${account.agent_id}`}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditWhatsapp(account)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWhatsapp(account.whatsapp_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ERP & WMS Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            ERP & WMS
          </h2>

          <div className="mb-4">
            <Label className="text-base font-medium">Choose Your ERP / WMS</Label>
            <p className="text-sm text-muted-foreground mb-3">Select one platform to integrate with</p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                variant={erpChoice === "sap" ? "default" : "outline"}
                onClick={() => handleErpChoice("sap")}
                className="flex-1"
              >
                SAP Business One
              </Button>
              <Button
                variant={erpChoice === "odoo" ? "default" : "outline"}
                onClick={() => handleErpChoice("odoo")}
                className="flex-1"
              >
                Odoo ERP
              </Button>
              <Button
                variant={erpChoice === "accurate" ? "default" : "outline"}
                onClick={() => handleErpChoice("accurate")}
                className="flex-1"
              >
                Accurate (ERP & WMS)
              </Button>
            </div>
          </div>

          {/* Accurate ERP/WMS */}
          {erpChoice === "accurate" && (
            <Card>
              <CardHeader>
                <CardTitle>Accurate</CardTitle>
                <CardDescription>Connect via Accurate redirect to sync ERP and warehouse data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Connection Status</p>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        accurateProvider?.is_active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {accurateProvider?.is_active ? "Connected" : "Not connected"}
                    </span>
                  </div>

                  {accurateProvider && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">User</div>
                      <div>
                        {accurateProvider.accurate_user_name || "Accurate user"}
                        {accurateProvider.accurate_user_email ? ` (${accurateProvider.accurate_user_email})` : ""}
                      </div>
                      <div className="text-muted-foreground">Database</div>
                      <div>{accurateProvider.db_alias || accurateProvider.db_id || "Not selected"}</div>
                      <div className="text-muted-foreground">Session</div>
                      <div>{accurateProvider.session_id || "-"}</div>
                      <div className="text-muted-foreground">Token Expires</div>
                      <div>{accurateProvider.expires_at ? new Date(accurateProvider.expires_at).toLocaleString() : "Unknown"}</div>
                    </div>
                  )}

                  {accurateError && <p className="text-sm text-destructive">{accurateError}</p>}

                  {accurateProvider?.is_active && (
                    <div className="space-y-3 pt-2 border-t border-muted">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Choose Database</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAccurateListDatabases}
                          disabled={accurateDbLoading}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${accurateDbLoading ? "animate-spin" : ""}`} />
                          Refresh list
                        </Button>
                      </div>
                      <Select value={selectedAccurateDbId} onValueChange={(v) => setSelectedAccurateDbId(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Accurate database" />
                        </SelectTrigger>
                        <SelectContent>
                          {accurateDatabases.map((db) => (
                            <SelectItem key={db.id} value={String(db.id)}>
                              {db.alias || db.name || `DB #${db.id}`} {db.host ? `(${db.host})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAccurateOpenDatabase}
                        disabled={accurateLoading || !selectedAccurateDbId}
                      >
                        Open Database
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAccurateConnect} className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {accurateProvider ? "Reconnect to Accurate" : "Connect to Accurate"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAccurateRefresh}
                    disabled={accurateLoading}
                    className="flex-1"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${accurateLoading ? "animate-spin" : ""}`} />
                    Refresh status
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  You will be redirected to Accurate to grant access. Return here and refresh to confirm the connection.
                </p>
              </CardContent>
            </Card>
          )}

          {/* SAP Business One */}
          {erpChoice === "sap" && (
            <Card>
              <CardHeader>
                <CardTitle>SAP Business One</CardTitle>
                <CardDescription>Connect to your SAP B1 system for real-time data synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sap-enabled" className="text-base font-medium">
                      Enable SAP B1 Integration
                    </Label>
                    <p className="text-sm text-muted-foreground">Sync products, customers, and orders with SAP Business One</p>
                  </div>
                  <Switch id="sap-enabled" checked={sapEnabled} onCheckedChange={setSapEnabled} />
                </div>

                {sapEnabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sap-base-url">Base URL</Label>
                        <Input
                          id="sap-base-url"
                          value={sapBaseUrl}
                          onChange={(e) => setSapBaseUrl(e.target.value)}
                          placeholder="https://your-sap-server:50000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sap-port">Port</Label>
                        <Input
                          id="sap-port"
                          value={sapPort}
                          onChange={(e) => setSapPort(e.target.value)}
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sap-company-db">Company Database</Label>
                      <Input
                        id="sap-company-db"
                        value={sapCompanyDb}
                        onChange={(e) => setSapCompanyDb(e.target.value)}
                        placeholder="SBODEMOUS"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sap-username">Username</Label>
                        <Input
                          id="sap-username"
                          value={sapUsername}
                          onChange={(e) => setSapUsername(e.target.value)}
                          placeholder="manager"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sap-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="sap-password"
                            type={showSapPassword ? "text" : "password"}
                            value={sapPassword}
                            onChange={(e) => setSapPassword(e.target.value)}
                            placeholder="Enter SAP password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowSapPassword(!showSapPassword)}
                          >
                            {showSapPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSapSave} className="w-full">
                      Save SAP B1 Configuration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Odoo ERP */}
          {erpChoice === "odoo" && (
            <Card>
              <CardHeader>
                <CardTitle>Odoo ERP</CardTitle>
                <CardDescription>Connect to your Odoo ERP system for product synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="odoo-enabled" className="text-base font-medium">
                      Enable Odoo Integration
                    </Label>
                    <p className="text-sm text-muted-foreground">Sync products and data with your Odoo ERP system</p>
                  </div>
                  <Switch id="odoo-enabled" checked={odooEnabled} onCheckedChange={setOdooEnabled} />
                </div>

                {odooEnabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="odoo-url">Server URL</Label>
                      <Input
                        id="odoo-url"
                        value={odooUrl}
                        onChange={(e) => setOdooUrl(e.target.value)}
                        placeholder="https://your-odoo-instance.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="odoo-database">Database Name</Label>
                      <Input
                        id="odoo-database"
                        value={odooDatabase}
                        onChange={(e) => setOdooDatabase(e.target.value)}
                        placeholder="your_database_name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="odoo-username">Username</Label>
                        <Input
                          id="odoo-username"
                          value={odooUsername}
                          onChange={(e) => setOdooUsername(e.target.value)}
                          placeholder="admin"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="odoo-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="odoo-password"
                            type={showOdooPassword ? "text" : "password"}
                            value={odooPassword}
                            onChange={(e) => setOdooPassword(e.target.value)}
                            placeholder="Enter Odoo password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowOdooPassword(!showOdooPassword)}
                          >
                            {showOdooPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleOdooSave} className="w-full">
                      Save Configuration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* WhatsApp Method Selection Dialog */}
      <Dialog open={isWhatsappMethodDialogOpen} onOpenChange={setIsWhatsappMethodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add WhatsApp Account</DialogTitle>
            <DialogDescription>Choose how you want to connect your WhatsApp Business account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Button
              onClick={handleWhatsappOAuthLogin}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              variant="default"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="font-medium">Connect with Meta</span>
              <span className="text-xs opacity-80">Authenticate via Meta OAuth (recommended)</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              onClick={handleManualWhatsappInput}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Edit className="h-5 w-5" />
              <span className="font-medium">Input Access Token</span>
              <span className="text-xs text-muted-foreground">Manually enter your API credentials</span>
            </Button>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setIsWhatsappMethodDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Manual Input Dialog */}
      <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWhatsapp ? "Edit WhatsApp Account" : "Add WhatsApp Account"}</DialogTitle>
            <DialogDescription>Configure WhatsApp Business API credentials and link to an agent</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">Phone Number</Label>
              <Input
                id="whatsapp-phone"
                value={whatsappForm.phone_number}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, phone_number: e.target.value })}
                placeholder="e.g. +1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone-id">Phone Number ID</Label>
              <Input
                id="whatsapp-phone-id"
                value={whatsappForm.phone_number_id}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, phone_number_id: e.target.value })}
                placeholder="Enter phone number ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-token">WhatsApp API Token</Label>
              <div className="relative">
                <Input
                  id="whatsapp-token"
                  type={showWhatsappApiToken ? "text" : "password"}
                  value={whatsappForm.access_token}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, access_token: e.target.value })}
                  placeholder="Enter API token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowWhatsappApiToken(!showWhatsappApiToken)}
                >
                  {showWhatsappApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-verify">Verify Token</Label>
              <div className="relative">
                <Input
                  id="whatsapp-verify"
                  type={showWhatsappVerifyToken ? "text" : "password"}
                  value={whatsappForm.verify_token}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, verify_token: e.target.value })}
                  placeholder="Enter verify token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowWhatsappVerifyToken(!showWhatsappVerifyToken)}
                >
                  {showWhatsappVerifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-agent-select">Linked Agent</Label>
              <Select
                value={whatsappForm.agent_id !== "" ? String(whatsappForm.agent_id) : ""}
                onValueChange={(v) => setWhatsappForm({ ...whatsappForm, agent_id: Number(v) })}
              >
                <SelectTrigger id="whatsapp-agent-select">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.agent_id} value={String(a.agent_id)}>
                      {a.agent_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsWhatsappDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWhatsapp}>{editingWhatsapp ? "Update" : "Add"} WhatsApp</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;


