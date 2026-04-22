import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CustomerStatus = "new" | "contacted" | "interested" | "closed";

interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
}

export const EditCustomerForm = ({
  customer,
  onSubmit,
}: {
  customer: Customer;
  onSubmit: (data: any) => void;
}) => {
  const [form, setForm] = useState({
    customer_name: customer.name,
    phone_number: customer.phone || "",
    address: customer.address || "",
    lead_status: customer.status,
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Name"
        value={form.customer_name}
        onChange={(e) =>
          setForm({ ...form, customer_name: e.target.value })
        }
      />

      <Input
        placeholder="Phone"
        value={form.phone_number}
        onChange={(e) =>
          setForm({ ...form, phone_number: e.target.value })
        }
      />

      <Input
        placeholder="Address"
        value={form.address}
        onChange={(e) =>
          setForm({ ...form, address: e.target.value })
        }
      />

      <select
        className="w-full border rounded p-2"
        value={form.lead_status}
        onChange={(e) =>
          setForm({
            ...form,
            lead_status: e.target.value as CustomerStatus,
          })
        }
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="interested">Interested</option>
        <option value="closed">Closed</option>
      </select>

      <Button onClick={() => onSubmit(form)} className="w-full">
        Save Changes
      </Button>
    </div>
  );
};