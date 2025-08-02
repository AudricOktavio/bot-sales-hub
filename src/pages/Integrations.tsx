import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Settings, CreditCard, Database, MessageCircle } from 'lucide-react';

const Integrations = () => {
  const { toast } = useToast();

  // Midtrans settings
  const [midtransEnabled, setMidtransEnabled] = useState(false);
  const [midtransServerKey, setMidtransServerKey] = useState('');
  const [midtransClientKey, setMidtransClientKey] = useState('');
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false);

  // SAP B1 settings
  const [sapEnabled, setSapEnabled] = useState(false);
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

  const handleMidtransSave = () => {
    if (!midtransServerKey || !midtransClientKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in both server key and client key",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Midtrans Settings Saved",
      description: "Payment gateway configuration has been updated",
    });
  };

  const handleSapSave = () => {
    if (!sapBaseUrl || !sapCompanyDb || !sapUsername || !sapPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all SAP B1 connection details",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "SAP B1 Settings Saved",
      description: "ERP integration configuration has been updated",
    });
  };

  const handleWhatsappSave = () => {
    if (!whatsappApiToken || !whatsappPhoneNumberId || !whatsappVerifyToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all WhatsApp Business API details",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "WhatsApp Settings Saved",
      description: "Messaging integration configuration has been updated",
    });
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