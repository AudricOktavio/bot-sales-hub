import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CustomerPipeline from "@/components/CustomerPipeline";
import StatusBadge from "@/components/common/StatusBadge";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { hasToken } from "@/utils/auth";
import CustomerCreateDialog from "@/components/CustomerCreateDialog";
import { EditCustomerForm } from "@/components/EditCustomerForm";
import { Trash2 } from "lucide-react";


// ----- Mock chat -----
const chatHistory = [
  // (keep your existing mock chat objects here if you want them)
];

type CustomerStatus = "new" | "contacted" | "interested" | "closed";
// API response interface (backend unchanged)
interface ApiContact {
  customer_id: number;
  customer_name: string;
  phone_number: string;
  address: string;
  lead_status: CustomerStatus;
  // backend has no status column yet
}

// UI model
interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
  lastActivity?: string;
  value?: string;
  assignedAgent?: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}
interface ChatHistory {
  id: number;
  customerId: number;
  messages: ChatMessage[];
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pipeline");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditOpen(true);
  };

  // Load customers from API + merge with client-side statuses
  const loadCustomers = async (search?: string) => {
    if (!hasToken()) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      window.location.href = "/login";
      return;
    }

    try {
      setIsLoading(true);
      const params = search ? { search } : {};
      const { data } = await api.get<ApiContact[]>(
        `${API_CONFIG.ENDPOINTS.CONTACTS}`,
        { params }
      );

      const formatted: Customer[] = data.map((c) => ({
        id: c.customer_id,
        name: c.customer_name,
        company: c.phone_number || "",
        email: c.phone_number || "",
        phone: c.phone_number,
        address: c.address,
        status: c.lead_status ?? "new",
        lastActivity: "",
        value: undefined,
        assignedAgent: "Unassigned",
      }));

      setCustomers(formatted);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive",
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, []);

  // Search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        loadCustomers(searchTerm);
      } else {
        loadCustomers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredCustomers = customers;

  // Change status locally (no backend call) and persist in localStorage
  const handleStatusChange = async (
    customerId: number,
    newStatus: Customer["status"]
  ) => {
    // optimistic update
    const prevCustomers = customers;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, status: newStatus } : c
      )
    );

    try {
      await api.patch(
        getApiUrl("CONTACT_STATUS", customerId),
        { lead_status: newStatus }
      );

      toast({
        title: "Customer Status Updated",
        description: `Moved to ${newStatus}`,
      });
    } catch (error) {
      console.error(error);

      // rollback if failed
      setCustomers(prevCustomers);

      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const createCustomer = async (customerData: {
    customer_name: string;
    phone_number: string;
    address: string;
  }) => {
    setIsCreating(true);
    try {
      const { data: created } = await api.post<ApiContact>(
        `${API_CONFIG.ENDPOINTS.CONTACTS_CREATE}`,
        customerData
      );

      // Initialize local status for the new contact

      toast({
        title: "Customer Created",
        description: "New customer has been added successfully",
      });

      setIsCreateDialogOpen(false);
      loadCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCustomer = async (customerId: number) => {
    try {
      await api.delete(`${API_CONFIG.ENDPOINTS.CONTACT_BY_ID(customerId)}`);

      // Remove local status too

      toast({
        title: "Customer Deleted",
        description: "Customer has been removed successfully",
      });

      loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const updateCustomer = async (updatedData: {
    customer_name: string;
    phone_number: string;
    address: string;
    lead_status: CustomerStatus;
  }) => {
    if (!editingCustomer) return;

    try {
      await api.put(
        API_CONFIG.ENDPOINTS.CONTACT_BY_ID(editingCustomer.id),
        updatedData
      );

      toast({
        title: "Customer Updated",
        description: "Customer updated successfully",
      });

      setIsEditOpen(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  const getCustomerChat = (customerId: number): ChatHistory | undefined => {
    return (chatHistory as ChatHistory[]).find(
      (chat) => chat.customerId === customerId
    );
  };

  return (
    <div className="crm-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Track leads and manage customer relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Add Customer
          </Button>
          <Button variant="outline">Import</Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg"
          disabled={isLoading}
        />
        {isLoading && (
          <p className="text-sm text-muted-foreground mt-2">Searching...</p>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <CustomerPipeline
            customers={filteredCustomers}
            onStatusChange={handleStatusChange}
            onSelectCustomer={handleSelectCustomer}
          />
        </TabsContent>

        <TabsContent value="list">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Customer</th>
                  <th className="py-3 px-4 text-left font-medium">Contact</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Agent</th>
                  <th className="py-3 px-4 text-left font-medium">
                    Last Activity
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.company && customer.company !== "N/A"
                          ? customer.company
                          : ""}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        {customer.phone && customer.phone !== "N/A"
                          ? customer.phone
                          : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.address && customer.address !== "N/A"
                          ? customer.address
                          : ""}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="py-3 px-4">
                      {customer.assignedAgent && customer.assignedAgent !== "N/A"
                        ? customer.assignedAgent
                        : ""}
                    </td>
                    <td className="py-3 px-4">
                      {customer.lastActivity && customer.lastActivity !== "N/A"
                        ? customer.lastActivity
                        : ""}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomer(customer.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.phone} · {selectedCustomer?.address}
            </DialogDescription>
          </DialogHeader>

          {/* keep your details UI here */}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>

          {editingCustomer && (
            <EditCustomerForm
              customer={editingCustomer}
              onSubmit={updateCustomer}
            />
          )}
        </DialogContent>
      </Dialog>

      <CustomerCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateCustomer={createCustomer}
        isLoading={isCreating}
      />
    </div>
  );
};

export default Customers;
