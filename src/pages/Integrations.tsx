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
  phone_number_id: string;
  access_token: string;
  verify_token: string;
  agent_id: number;
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
  const [editingWhatsapp, setEditingWhatsapp] = useState<WhatsAppAccount | null>(null);
  const [whatsappForm, setWhatsappForm] = useState({
    phone_number_id: "",
    access_token: "",
    verify_token: "",
    agent_id: "" as number | "",
  });
  const [showWhatsappApiToken, setShowWhatsappApiToken] = useState(false);
  const [showWhatsappVerifyToken, setShowWhatsappVerifyToken] = useState(false);
  const [agents, setAgents] = useState<Array<{ agent_id: number; agent_name: string }>>([]);

  // ERP Selection
  const [erpChoice, setErpChoice] = useState<"none" | "sap" | "odoo">("none");

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
        const [agentsRes, paymentRes, whatsRes, sapRes, odooRes] = await Promise.allSettled([
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_PROVIDER}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPPS}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAP_PROVIDER}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ODOO_PROVIDER}`, { headers }),
        ]);

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
          if (s?.is_active) setErpChoice("sap");
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
          if (o?.is_active) setErpChoice("odoo");
        } else {
          setOdooEnabled(false);
          setOdooExists(false);
        }
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
    setEditingWhatsapp(null);
    setWhatsappForm({
      phone_number_id: "",
      access_token: "",
      verify_token: "",
      agent_id: "",
    });
    setIsWhatsappDialogOpen(true);
  };

  const handleEditWhatsapp = (account: WhatsAppAccount) => {
    setEditingWhatsapp(account);
    setWhatsappForm({
      phone_number_id: account.phone_number_id,
      access_token: account.access_token,
      verify_token: account.verify_token,
      agent_id: account.agent_id,
    });
    setIsWhatsappDialogOpen(true);
  };

  const handleSaveWhatsapp = async () => {
    if (
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

  const handleErpChoice = async (choice: "sap" | "odoo") => {
    // If switching from one ERP to another, disable the current one
    if (choice === "sap" && odooEnabled) {
      setOdooEnabled(false);
    } else if (choice === "odoo" && sapEnabled) {
      setSapEnabled(false);
    }
    setErpChoice(choice);

    if (choice === "sap") {
      setSapEnabled(true);
    } else if (choice === "odoo") {
      setOdooEnabled(true);
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
                        <TableHead>Phone Number ID</TableHead>
                        <TableHead>Linked Agent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {whatsappAccounts.map((account) => (
                        <TableRow key={account.whatsapp_id}>
                          <TableCell className="font-medium">{account.phone_number_id}</TableCell>
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
            <Label className="text-base font-medium">Choose Your ERP System</Label>
            <p className="text-sm text-muted-foreground mb-3">Select one ERP system to integrate with</p>
            <div className="flex gap-3">
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
            </div>
          </div>

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

      {/* WhatsApp Dialog */}
      <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWhatsapp ? "Edit WhatsApp Account" : "Add WhatsApp Account"}</DialogTitle>
            <DialogDescription>Configure WhatsApp Business API credentials and link to an agent</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
