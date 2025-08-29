import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Settings, CreditCard, Database, MessageCircle } from 'lucide-react';
import { API_CONFIG } from '@/config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const Integrations = () => {
  const { toast } = useToast();

  // Midtrans settings
  const [midtransEnabled, setMidtransEnabled] = useState(false);
  const [midtransServerKey, setMidtransServerKey] = useState('');
  const [midtransClientKey, setMidtransClientKey] = useState('');
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false);
  const [midtransExists, setMidtransExists] = useState(false);

  // SAP B1 settings
  const [sapEnabled, setSapEnabled] = useState(false);
  const [sapExists, setSapExists] = useState(false); // <-- Add this
  const [sapBaseUrl, setSapBaseUrl] = useState('');
  const [sapCompanyDb, setSapCompanyDb] = useState('');
  const [sapUsername, setSapUsername] = useState('');
  const [sapPassword, setSapPassword] = useState('');
  const [sapPort, setSapPort] = useState('');
  const [showSapPassword, setShowSapPassword] = useState(false);

  // WhatsApp settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappApiToken, setWhatsappApiToken] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState('');
  const [showWhatsappApiToken, setShowWhatsappApiToken] = useState(false);
  const [showWhatsappVerifyToken, setShowWhatsappVerifyToken] = useState(false);
  const [whatsappId, setWhatsappId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');
  const [agents, setAgents] = useState<Array<{ agent_id: number; agent_name: string }>>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchAll = async () => {
      const headers = getAuthHeaders();
      try {
        const [agentsRes, paymentRes, whatsRes, sapRes] = await Promise.allSettled([
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AGENTS}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT_PROVIDER}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPPS}`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAP_PROVIDER}`, { headers }), // <-- SAP status
        ]);

        if (agentsRes.status === 'fulfilled') {
          setAgents(agentsRes.value.data || []);
        }

        if (paymentRes.status === 'fulfilled') {
          const p = paymentRes.value.data;
          setMidtransEnabled(!!p?.is_active);
          setMidtransServerKey(p?.server_key || '');
          setMidtransClientKey(p?.client_key || '');
          setMidtransExists(true);
        } else {
          setMidtransExists(false);
        }

        if (whatsRes.status === 'fulfilled') {
          const list = whatsRes.value.data || [];
          if (Array.isArray(list) && list.length > 0) {
            const w = list[0];
            setWhatsappEnabled(true);
            setWhatsappApiToken(w?.access_token || '');
            setWhatsappPhoneNumberId(w?.phone_number_id || '');
            setWhatsappVerifyToken(w?.verify_token || '');
            setWhatsappId(w?.whatsapp_id ?? w?.id ?? null);
            setSelectedAgentId(typeof w?.agent_id === 'number' ? w.agent_id : '');
          }
        }

        // SAP status
        if (sapRes.status === 'fulfilled') {
          const s = sapRes.value.data;
          setSapEnabled(!!s?.is_active);
          setSapExists(!!s?.is_active);
          // Optionally set other SAP fields if returned
          setSapBaseUrl(s?.base_url || '');
          setSapCompanyDb(s?.company_db || '');
          setSapUsername(s?.username || '');
          setSapPassword(s?.password || '');
          setSapPort(s?.port || '');
        } else {
          setSapEnabled(false);
          setSapExists(false);
        }
      } catch (error) {
        console.error('Integrations init error:', error);
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
          setMidtransServerKey('');
          setMidtransClientKey('');
          toast({
            title: 'Midtrans Disabled',
            description: 'Payment provider removed.',
          });
        } catch (error: any) {
          console.error('Midtrans disable error:', error);
          toast({
            title: 'Failed to disable Midtrans',
            description: error?.response?.data?.message || 'An error occurred.',
            variant: 'destructive',
          });
          setMidtransEnabled(true); // <-- Keep toggle ON if API fails
        }
      }
      prevMidtransEnabled.current = midtransEnabled;
    };
    run();
  }, [midtransEnabled, midtransExists]);

  // WhatsApp toggle logic
  const prevWhatsappEnabled = useRef(whatsappEnabled);
  useEffect(() => {
    const run = async () => {
      if (prevWhatsappEnabled.current && !whatsappEnabled && whatsappId) {
        try {
          const headers = getAuthHeaders();
          await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP_BY_ID(Number(whatsappId))}`, { headers });
          setWhatsappId(null);
          setWhatsappApiToken('');
          setWhatsappPhoneNumberId('');
          setWhatsappVerifyToken('');
          setSelectedAgentId('');
          toast({
            title: 'WhatsApp Disabled',
            description: 'WhatsApp integration removed.',
          });
        } catch (error: any) {
          console.error('WhatsApp disable error:', error);
          toast({
            title: 'Failed to disable WhatsApp',
            description: error?.response?.data?.message || 'An error occurred.',
            variant: 'destructive',
          });
          setWhatsappEnabled(true); // <-- Keep toggle ON if API fails
        }
      }
      prevWhatsappEnabled.current = whatsappEnabled;
    };
    run();
  }, [whatsappEnabled, whatsappId]);

  // SAP toggle logic
  const prevSapEnabled = useRef(sapEnabled);
  useEffect(() => {
    const run = async () => {
      if (prevSapEnabled.current && !sapEnabled && sapExists) {
        try {
          const headers = getAuthHeaders();
          await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAP_PROVIDER}`, { headers });
          setSapExists(false);
          setSapBaseUrl('');
          setSapCompanyDb('');
          setSapUsername('');
          setSapPassword('');
          setSapPort('');
          toast({
            title: 'SAP Disabled',
            description: 'SAP integration removed.',
          });
        } catch (error: any) {
          console.error('SAP disable error:', error);
          toast({
            title: 'Failed to disable SAP',
            description: error?.response?.data?.message || 'An error occurred.',
            variant: 'destructive',
          });
          setSapEnabled(true); // <-- Keep toggle ON if API fails
        }
      }
      prevSapEnabled.current = sapEnabled;
    };
    run();
  }, [sapEnabled, sapExists]);

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
          provider_name: "SAP B1", // you can make this dynamic
          base_url: sapBaseUrl,
          port: sapPort,
          company_db: sapCompanyDb,
          username: sapUsername,
          password: sapPassword,
          verify_ssl: false,
          is_active: sapEnabled
        },
        { headers }
      );
  
      toast({
        title: "SAP B1 Settings Saved",
        description: "ERP integration configuration has been updated",
      });
    } catch (error) {
      console.error("SAP Save Error:", error);
      toast({
        title: "Failed to Save SAP Settings",
        description: error?.response?.data?.message || "An error occurred while saving SAP settings.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsappSave = async () => {
    if (!whatsappApiToken || !whatsappPhoneNumberId || !whatsappVerifyToken || selectedAgentId === '') {
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
        phone_number_id: whatsappPhoneNumberId,
        access_token: whatsappApiToken,
        verify_token: whatsappVerifyToken,
        agent_id: Number(selectedAgentId),
      };

      if (whatsappId) {
        await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPP_BY_ID(Number(whatsappId))}`, payload, { headers });
      } else {
        const res = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WHATSAPPS}`, payload, { headers });
        const created = res?.data;
        if (created?.whatsapp_id) setWhatsappId(created.whatsapp_id);
      }

      toast({
        title: "WhatsApp Settings Saved",
        description: "Messaging integration configuration has been updated",
      });
    } catch (error: any) {
      console.error("WhatsApp Save Error:", error);
      toast({
        title: "Failed to Save WhatsApp Settings",
        description: error?.response?.data?.message || "An error occurred while saving WhatsApp settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="crm-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tools & Integrations</h1>
        <p className="text-muted-foreground mt-1">Configure third-party services and APIs</p>
      </div>

      <div className="space-y-6">
        {/* Midtrans Payment Gateway */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Midtrans Payment Gateway
            </CardTitle>
            <CardDescription>
              Configure Midtrans for payment processing in your sales flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="midtrans-enabled" className="text-base font-medium">
                  Enable Midtrans Integration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow your AI agents to process payments through Midtrans
                </p>
              </div>
              <Switch
                id="midtrans-enabled"
                checked={midtransEnabled}
                onCheckedChange={setMidtransEnabled}
              />
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
                      {showMidtransServerKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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

        {/* SAP Business One */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              SAP Business One
            </CardTitle>
            <CardDescription>
              Connect to your SAP B1 system for real-time data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sap-enabled" className="text-base font-medium">
                  Enable SAP B1 Integration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sync products, customers, and orders with SAP Business One
                </p>
              </div>
              <Switch
                id="sap-enabled"
                checked={sapEnabled}
                onCheckedChange={setSapEnabled}
              />
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
                        {showSapPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
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

        {/* Meta WhatsApp Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Meta WhatsApp Business
            </CardTitle>
            <CardDescription>
              Connect WhatsApp Business API for messaging capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whatsapp-enabled" className="text-base font-medium">
                  Enable WhatsApp Integration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow your AI agents to communicate via WhatsApp
                </p>
              </div>
              <Switch
                id="whatsapp-enabled"
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
            </div>

            {whatsappEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-api-token">WhatsApp API Token</Label>
                  <div className="relative">
                    <Input
                      id="whatsapp-api-token"
                      type={showWhatsappApiToken ? "text" : "password"}
                      value={whatsappApiToken}
                      onChange={(e) => setWhatsappApiToken(e.target.value)}
                      placeholder="Enter your WhatsApp API token"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowWhatsappApiToken(!showWhatsappApiToken)}
                    >
                      {showWhatsappApiToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-phone-number-id">Phone Number ID</Label>
                  <Input
                    id="whatsapp-phone-number-id"
                    value={whatsappPhoneNumberId}
                    onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                    placeholder="Enter your WhatsApp phone number ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-agent">Linked Agent</Label>
                  <Select
                    value={selectedAgentId !== '' ? String(selectedAgentId) : ''}
                    onValueChange={(v) => setSelectedAgentId(Number(v))}
                  >
                    <SelectTrigger id="whatsapp-agent">
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

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-verify-token">Verify Token</Label>
                  <div className="relative">
                    <Input
                      id="whatsapp-verify-token"
                      type={showWhatsappVerifyToken ? "text" : "password"}
                      value={whatsappVerifyToken}
                      onChange={(e) => setWhatsappVerifyToken(e.target.value)}
                      placeholder="Enter your WhatsApp verify token"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowWhatsappVerifyToken(!showWhatsappVerifyToken)}
                    >
                      {showWhatsappVerifyToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleWhatsappSave} className="w-full">
                  Save WhatsApp Configuration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;