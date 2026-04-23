import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, ChevronLeft, Loader2, Save, CheckCheck, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";
import AgentChatPanel from "@/components/AgentChatPanel";

interface ApiAgent {
  agent_id: number;
  agent_name: string;
  category: string;
  phone_number_id: string;
  prompt?: string | null;
  handover_prompt?: string | null;
  allow_default_handover?: boolean | null;
}

interface ProductAgentRelationship {
  relationship_id: number;
  product_id: number;
  agent_id: number;
}

interface ProductIdName {
  product_id: number;
  product_name: string;
}

interface AssignedItem {
  relationship_id: number;
  product_id: number;
  product_name: string;
  category?: string;
}

interface ApiProductFull {
  product_id: number;
  product_name: string;
  category: string;
}

const PAGE_SIZE = 100;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AgentDetail = () => {
  const { agentId: agentIdParam } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const agentId = Number(agentIdParam);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chatResetKey, setChatResetKey] = useState(0);

  const [form, setForm] = useState({
    agent_name: "",
    category: "",
    prompt: "",
    handover_prompt: "",
    allow_default_handover: false,
  });

  // Product management state
  const [assigned, setAssigned] = useState<AssignedItem[]>([]);
  const [unassigned, setUnassigned] = useState<ProductIdName[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selectedAssigned, setSelectedAssigned] = useState<Set<number>>(new Set());
  const [selectedUnassigned, setSelectedUnassigned] = useState<Set<number>>(new Set());
  const [searchAssigned, setSearchAssigned] = useState("");
  const [searchUnassigned, setSearchUnassigned] = useState("");

  // Infinite scroll + category filter state
  const [categories, setCategories] = useState<string[]>([]);
  const [assignedCategory, setAssignedCategory] = useState<string>("all");
  const [unassignedCategory, setUnassignedCategory] = useState<string>("all");
  const [assignedHasMore, setAssignedHasMore] = useState(true);
  const [unassignedHasMore, setUnassignedHasMore] = useState(true);
  const [assignedLoadingMore, setAssignedLoadingMore] = useState(false);
  const [unassignedLoadingMore, setUnassignedLoadingMore] = useState(false);
  const [assignByCategoryOpen, setAssignByCategoryOpen] = useState(false);
  const [assignByCategorySelected, setAssignByCategorySelected] = useState<string>("");

  const fetchAgent = async () => {
    try {
      const { data } = await axios.get<ApiAgent>(getApiUrl("AGENT_BY_ID", agentId), {
        headers: authHeaders(),
      });
      setForm({
        agent_name: data.agent_name ?? "",
        category: data.category ?? "",
        prompt: data.prompt ?? "",
        handover_prompt: data.handover_prompt ?? "",
        allow_default_handover: Boolean(data.allow_default_handover),
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load agent.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch the global product name lookup once (limited) — used to render assigned items
  const [nameLookup, setNameLookup] = useState<Map<number, { name: string; category: string }>>(
    new Map()
  );

  const ensureNamesFor = async (ids: number[]) => {
    const missing = ids.filter((id) => !nameLookup.has(id));
    if (missing.length === 0) return nameLookup;
    // Fetch all products in pages; cheaper alternative would be a by-ids endpoint.
    const next = new Map(nameLookup);
    let lastId = 0;
    let keepGoing = true;
    const needed = new Set(missing);
    while (keepGoing && needed.size > 0) {
      const { data } = await axios.get<ApiProductFull[]>(getApiUrl("PRODUCTS"), {
        headers: authHeaders(),
        params: { limit: PAGE_SIZE, last_product_id: lastId },
      });
      if (!data || data.length === 0) break;
      for (const p of data) {
        next.set(p.product_id, { name: p.product_name, category: p.category });
        needed.delete(p.product_id);
      }
      lastId = data[data.length - 1].product_id;
      if (data.length < PAGE_SIZE) keepGoing = false;
    }
    setNameLookup(next);
    return next;
  };

  const fetchAssignedPage = async (reset: boolean) => {
    if (reset) {
      setProductsLoading(true);
    } else {
      setAssignedLoadingMore(true);
    }
    try {
      const lastId = reset ? 0 : assigned[assigned.length - 1]?.product_id ?? 0;
      const params: Record<string, any> = { limit: PAGE_SIZE, last_product_id: lastId };
      if (assignedCategory !== "all") params.categories = [assignedCategory];
      const { data } = await axios.get<ProductAgentRelationship[]>(
        getApiUrl("PRODUCTS_BY_AGENT", agentId),
        { headers: authHeaders(), params, paramsSerializer: { indexes: null } }
      );
      const ids = data.map((r) => r.product_id);
      const lookup = await ensureNamesFor(ids);
      const items: AssignedItem[] = data.map((r) => ({
        relationship_id: r.relationship_id,
        product_id: r.product_id,
        product_name: lookup.get(r.product_id)?.name ?? `Product #${r.product_id}`,
        category: lookup.get(r.product_id)?.category,
      }));
      setAssigned((prev) => (reset ? items : [...prev, ...items]));
      setAssignedHasMore(data.length === PAGE_SIZE);
      if (reset) setSelectedAssigned(new Set());
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load assigned.", variant: "destructive" });
    } finally {
      setProductsLoading(false);
      setAssignedLoadingMore(false);
    }
  };

  const fetchUnassignedPage = async (reset: boolean) => {
    if (reset) setProductsLoading(true);
    else setUnassignedLoadingMore(true);
    try {
      const lastId = reset ? 0 : unassigned[unassigned.length - 1]?.product_id ?? 0;
      const params: Record<string, any> = { limit: PAGE_SIZE, last_product_id: lastId };
      if (unassignedCategory !== "all") params.categories = [unassignedCategory];
      const { data } = await axios.get<ProductIdName[]>(
        getApiUrl("UNASSIGNED_PRODUCTS_BY_AGENT", agentId),
        { headers: authHeaders(), params, paramsSerializer: { indexes: null } }
      );
      setUnassigned((prev) => (reset ? data : [...prev, ...data]));
      setUnassignedHasMore(data.length === PAGE_SIZE);
      if (reset) setSelectedUnassigned(new Set());
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load unassigned.", variant: "destructive" });
    } finally {
      setProductsLoading(false);
      setUnassignedLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Pull a page of products to derive the category list (best-effort).
      const { data } = await axios.get<ApiProductFull[]>(getApiUrl("PRODUCTS"), {
        headers: authHeaders(),
        params: { limit: 500, last_product_id: 0 },
      });
      const set = new Set<string>();
      for (const p of data) if (p.category) set.add(p.category);
      setCategories(Array.from(set).sort());
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchAssignedPage(true), fetchUnassignedPage(true)]);
  };

  useEffect(() => {
    if (!Number.isFinite(agentId)) return;
    fetchAgent();
    fetchCategories();
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  // Re-fetch when category filter changes
  useEffect(() => {
    if (!Number.isFinite(agentId)) return;
    fetchAssignedPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedCategory]);

  useEffect(() => {
    if (!Number.isFinite(agentId)) return;
    fetchUnassignedPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unassignedCategory]);

  const handleSaveConfig = async () => {
    if (!form.agent_name || !form.category) {
      toast({
        title: "Missing Information",
        description: "Agent name and category are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        getApiUrl("AGENT_BY_ID", agentId),
        {
          agent_name: form.agent_name,
          category: form.category,
          prompt: form.prompt || undefined,
          handover_prompt: form.handover_prompt || undefined,
          allow_default_handover: form.allow_default_handover,
        },
        { headers: authHeaders() }
      );
      toast({ title: "Saved", description: "Agent configuration updated." });
      // Reset chat so it reflects the new behavior immediately
      setChatResetKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save agent.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSelected = async () => {
    if (selectedUnassigned.size === 0) return;
    setBulkBusy(true);
    try {
      const payload = Array.from(selectedUnassigned).map((product_id) => ({
        product_id,
        agent_id: agentId,
      }));
      await axios.post(getApiUrl("PRODUCT_AGENT_RELATIONSHIPS"), payload, {
        headers: authHeaders(),
      });
      toast({ title: "Assigned", description: `${payload.length} product(s) assigned.` });
      await refreshAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to assign products.", variant: "destructive" });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleUnassignSelected = async () => {
    if (selectedAssigned.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedAssigned);
      await axios.delete(getApiUrl("PRODUCT_AGENT_RELATIONSHIPS"), {
        headers: authHeaders(),
        data: ids,
      });
      toast({ title: "Removed", description: `${ids.length} product(s) removed.` });
      await refreshAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to remove products.", variant: "destructive" });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleAssignAll = async () => {
    setBulkBusy(true);
    try {
      // Treat currently-selected unassigned items as exceptions (skip them).
      const exception_product_ids = Array.from(selectedUnassigned);
      await axios.post(
        getApiUrl("AGENT_ASSIGN_ALL_PRODUCTS", agentId),
        { exception_product_ids: exception_product_ids.length ? exception_product_ids : null },
        { headers: authHeaders() }
      );
      toast({ title: "Assigned", description: "All unassigned products were assigned." });
      await refreshAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to assign all products.", variant: "destructive" });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleAssignByCategory = async () => {
    if (!assignByCategorySelected) return;
    setBulkBusy(true);
    try {
      await axios.post(
        getApiUrl("AGENT_ASSIGN_BY_CATEGORY", agentId),
        { category_name: assignByCategorySelected },
        { headers: authHeaders() }
      );
      toast({
        title: "Assigned",
        description: `Assigned all "${assignByCategorySelected}" products.`,
      });
      setAssignByCategoryOpen(false);
      setAssignByCategorySelected("");
      await refreshAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to assign by category.", variant: "destructive" });
    } finally {
      setBulkBusy(false);
    }
  };

  const filteredAssigned = useMemo(
    () =>
      assigned.filter((a) =>
        a.product_name.toLowerCase().includes(searchAssigned.toLowerCase())
      ),
    [assigned, searchAssigned]
  );
  const filteredUnassigned = useMemo(
    () =>
      unassigned.filter((p) =>
        p.product_name.toLowerCase().includes(searchUnassigned.toLowerCase())
      ),
    [unassigned, searchUnassigned]
  );

  const toggle = (set: Set<number>, id: number, setter: (s: Set<number>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  if (!Number.isFinite(agentId)) {
    return <div className="crm-container">Invalid agent id.</div>;
  }

  return (
    <div className="crm-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/agent-management")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Agents
          </Button>
          <div>
            <h1 className="text-responsive-xl font-bold">
              {loading ? "Loading…" : form.agent_name || `Agent #${agentId}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure the agent and test it live.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Left: tabs */}
        <div className="min-h-0 flex flex-col">
          <Tabs defaultValue="configuration" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="products">Product Management</TabsTrigger>
            </TabsList>

            <TabsContent
              value="configuration"
              className="flex-1 min-h-0 mt-4"
            >
              <ScrollArea className="h-full pr-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent_name">Agent Name</Label>
                    <Input
                      id="agent_name"
                      value={form.agent_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, agent_name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between rounded-md border p-3">
                    <div>
                      <Label htmlFor="allow_default_handover" className="text-sm font-medium">
                        Allow Default Handover
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        If no custom handover prompt is set, allow default escalation rules.
                      </p>
                    </div>
                    <Switch
                      id="allow_default_handover"
                      checked={form.allow_default_handover}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, allow_default_handover: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="handover_prompt">Handover Prompt</Label>
                    <Textarea
                      id="handover_prompt"
                      rows={5}
                      className="min-h-[140px]"
                      placeholder="Rules for when to hand over to a human or switch agents..."
                      value={form.handover_prompt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, handover_prompt: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Sales Prompt</Label>
                    <Textarea
                      id="prompt"
                      rows={6}
                      className="min-h-[160px]"
                      placeholder="Instructions for how the AI should behave and sell..."
                      value={form.prompt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prompt: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveConfig} disabled={saving || loading}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="products" className="flex-1 min-h-0 mt-4">
              <div className="flex flex-col h-full gap-3">
                {/* Bulk assign toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAssignAll}
                    disabled={bulkBusy}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Assign All Unassigned
                    {selectedUnassigned.size > 0 ? ` (skip ${selectedUnassigned.size})` : ""}
                  </Button>

                  <Dialog open={assignByCategoryOpen} onOpenChange={setAssignByCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" disabled={bulkBusy}>
                        <FolderPlus className="h-4 w-4 mr-1" />
                        Assign By Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign products by category</DialogTitle>
                        <DialogDescription>
                          All products in the selected category will be assigned to this agent.
                        </DialogDescription>
                      </DialogHeader>
                      <Select
                        value={assignByCategorySelected}
                        onValueChange={setAssignByCategorySelected}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setAssignByCategoryOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAssignByCategory}
                          disabled={!assignByCategorySelected || bulkBusy}
                        >
                          {bulkBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                          Assign
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 flex-1 min-h-0">
                {/* Unassigned */}
                <div className="flex flex-col border rounded-lg overflow-hidden bg-card min-h-0">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">
                        Unassigned ({unassigned.length}{unassignedHasMore ? "+" : ""})
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {selectedUnassigned.size} selected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search…"
                        value={searchUnassigned}
                        onChange={(e) => setSearchUnassigned(e.target.value)}
                        className="h-8 flex-1"
                      />
                      <Select value={unassignedCategory} onValueChange={setUnassignedCategory}>
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div
                    className="flex-1 overflow-auto"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (
                        unassignedHasMore &&
                        !unassignedLoadingMore &&
                        el.scrollTop + el.clientHeight >= el.scrollHeight - 80
                      ) {
                        fetchUnassignedPage(false);
                      }
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {productsLoading ? (
                        <p className="text-sm text-muted-foreground p-2">Loading…</p>
                      ) : filteredUnassigned.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">No products.</p>
                      ) : (
                        filteredUnassigned.map((p) => (
                          <label
                            key={p.product_id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedUnassigned.has(p.product_id)}
                              onCheckedChange={() =>
                                toggle(selectedUnassigned, p.product_id, setSelectedUnassigned)
                              }
                            />
                            <span className="text-sm flex-1 truncate">{p.product_name}</span>
                            <span className="text-xs text-muted-foreground">#{p.product_id}</span>
                          </label>
                        ))
                      )}
                      {unassignedLoadingMore && (
                        <p className="text-xs text-muted-foreground p-2 text-center">
                          Loading more…
                        </p>
                      )}
                      {!unassignedHasMore && unassigned.length > 0 && (
                        <p className="text-xs text-muted-foreground p-2 text-center">
                          End of list
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAssignSelected}
                    disabled={bulkBusy || selectedUnassigned.size === 0}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUnassignSelected}
                    disabled={bulkBusy || selectedAssigned.size === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Assigned */}
                <div className="flex flex-col border rounded-lg overflow-hidden bg-card min-h-0">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">
                        Assigned ({assigned.length}{assignedHasMore ? "+" : ""})
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {selectedAssigned.size} selected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search…"
                        value={searchAssigned}
                        onChange={(e) => setSearchAssigned(e.target.value)}
                        className="h-8 flex-1"
                      />
                      <Select value={assignedCategory} onValueChange={setAssignedCategory}>
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div
                    className="flex-1 overflow-auto"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (
                        assignedHasMore &&
                        !assignedLoadingMore &&
                        el.scrollTop + el.clientHeight >= el.scrollHeight - 80
                      ) {
                        fetchAssignedPage(false);
                      }
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {productsLoading ? (
                        <p className="text-sm text-muted-foreground p-2">Loading…</p>
                      ) : filteredAssigned.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">No products.</p>
                      ) : (
                        filteredAssigned.map((p) => (
                          <label
                            key={p.relationship_id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedAssigned.has(p.relationship_id)}
                              onCheckedChange={() =>
                                toggle(selectedAssigned, p.relationship_id, setSelectedAssigned)
                              }
                            />
                            <span className="text-sm flex-1 truncate">{p.product_name}</span>
                            <span className="text-xs text-muted-foreground">#{p.product_id}</span>
                          </label>
                        ))
                      )}
                      {assignedLoadingMore && (
                        <p className="text-xs text-muted-foreground p-2 text-center">
                          Loading more…
                        </p>
                      )}
                      {!assignedHasMore && assigned.length > 0 && (
                        <p className="text-xs text-muted-foreground p-2 text-center">
                          End of list
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: persistent chat */}
        <div className="min-h-0">
          <AgentChatPanel
            agentId={agentId}
            agentName={form.agent_name || `Agent #${agentId}`}
            resetKey={chatResetKey}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
