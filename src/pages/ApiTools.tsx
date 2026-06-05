import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Plus, Pencil, Trash2, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";

export interface ApiTool {
  api_id: number;
  name: string;
  description?: string | null;
  method: string;
  webhook_address: string;
  header_authorization?: string | null;
  header_token?: string | null;
  body?: string | null;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const emptyForm = {
  name: "",
  description: "",
  method: "POST",
  webhook_address: "",
  header_authorization: "",
  header_token: "",
  body: "",
};

const ApiTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tools, setTools] = useState<ApiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchTools = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<ApiTool[]>(getApiUrl("API_TOOLS"), {
        headers: authHeaders(),
      });
      setTools(data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load API tools.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (tool: ApiTool) => {
    setEditingId(tool.api_id);
    setForm({
      name: tool.name ?? "",
      description: tool.description ?? "",
      method: tool.method ?? "POST",
      webhook_address: tool.webhook_address ?? "",
      header_authorization: tool.header_authorization ?? "",
      header_token: tool.header_token ?? "",
      body: tool.body ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.method || !form.webhook_address) {
      toast({
        title: "Missing Information",
        description: "Name, method, and webhook address are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        method: form.method,
        webhook_address: form.webhook_address,
        header_authorization: form.header_authorization || null,
        header_token: form.header_token || null,
        body: form.body || null,
      };
      if (editingId != null) {
        await axios.put(getApiUrl("API_TOOL_BY_ID", editingId), payload, {
          headers: authHeaders(),
        });
        toast({ title: "Updated", description: `${form.name} updated.` });
      } else {
        await axios.post(getApiUrl("API_TOOLS"), payload, {
          headers: authHeaders(),
        });
        toast({ title: "Created", description: `${form.name} created.` });
      }
      setDialogOpen(false);
      await fetchTools();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save API tool.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this API tool? This will also remove any agent links.")) return;
    try {
      await axios.delete(getApiUrl("API_TOOL_BY_ID", id), {
        headers: authHeaders(),
      });
      toast({ title: "Deleted", description: "API tool removed." });
      setTools((prev) => prev.filter((t) => t.api_id !== id));
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete API tool.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="crm-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/integrations")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Integrations
          </Button>
          <div>
            <h1 className="text-responsive-xl font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5" /> AI Tools
            </h1>
            <p className="text-sm text-muted-foreground">
              Define webhook-based tools your AI agents can call.
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Tool
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Tools</CardTitle>
          <CardDescription>
            Tools you register here can be enabled per-agent from the agent configuration page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Loading…
            </p>
          ) : tools.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-3">No tools registered yet.</p>
              <Button variant="outline" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Create your first tool
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map((t) => (
                    <TableRow key={t.api_id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t.method}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                        {t.webhook_address}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-sm">
                        {t.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(t.api_id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId != null ? "Edit AI Tool" : "New AI Tool"}
            </DialogTitle>
            <DialogDescription>
              Configure the webhook this tool calls when invoked by an agent.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tool-name">Name</Label>
              <Input
                id="tool-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Create Shipment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-method">HTTP Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}
              >
                <SelectTrigger id="tool-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-url">Webhook Address</Label>
              <Input
                id="tool-url"
                value={form.webhook_address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, webhook_address: e.target.value }))
                }
                placeholder="https://api.example.com/hook"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tool-desc">Description</Label>
              <Textarea
                id="tool-desc"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What does this tool do? When should the AI call it?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-auth">Header: Authorization</Label>
              <Input
                id="tool-auth"
                value={form.header_authorization}
                onChange={(e) =>
                  setForm((f) => ({ ...f, header_authorization: e.target.value }))
                }
                placeholder="Bearer xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-token">Header: Token</Label>
              <Input
                id="tool-token"
                value={form.header_token}
                onChange={(e) =>
                  setForm((f) => ({ ...f, header_token: e.target.value }))
                }
                placeholder="Optional token header"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tool-body">Body Template (JSON)</Label>
              <Textarea
                id="tool-body"
                rows={5}
                className="font-mono text-xs"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder='{"customer": "{{customer_name}}"}'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId != null ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiTools;