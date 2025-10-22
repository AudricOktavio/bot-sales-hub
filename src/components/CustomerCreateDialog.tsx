import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomerCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCustomer: (customerData: {
    customer_name: string;
    phone_number: string;
    address: string;
  }) => void;
  isLoading?: boolean;
}

const CustomerCreateDialog = ({
  isOpen,
  onOpenChange,
  onCreateCustomer,
  isLoading = false,
}: CustomerCreateDialogProps) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.phone_number.trim()) {
      return;
    }
    onCreateCustomer(formData);
    setFormData({
      customer_name: "",
      phone_number: "",
      address: "",
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer record. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name *</Label>
            <Input
              id="customer-name"
              value={formData.customer_name}
              onChange={(e) => handleInputChange("customer_name", e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number *</Label>
            <Input
              id="phone-number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter customer address"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.customer_name.trim() ||
                !formData.phone_number.trim()
              }
            >
              {isLoading ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerCreateDialog;