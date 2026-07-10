import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { API_CONFIG } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

export interface OrganizationMember {
  id: number;
  organization_id: number;
  tenant_id: number;
  email: string;
  permission: string;
}

export interface ContactAssignment {
  assignment_id: number;
  customer_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number;
  status: string;
  assigned_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organizationId: number;
  currentTenantId: number | null;
  customerId: number | null;
  customerName?: string;
  members: OrganizationMember[];
  existingAssignment?: ContactAssignment | null;
  onSaved: () => void;
}

const AssignChatDialog = ({
  open,
  onOpenChange,
  organizationId,
  currentTenantId,
  customerId,
  customerName,
  members,
  existingAssignment,
  onSaved,
}: Props) => {
  const { toast } = useToast();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedTenantId(
        existingAssignment
          ? String(existingAssignment.assigned_to_user_id)
          : ""
      );
    }
  }, [open, existingAssignment]);

  const handleSave = async () => {
    if (!customerId) return;
    const targetTenantId = Number(selectedTenantId);
    if (!Number.isFinite(targetTenantId) || targetTenantId <= 0) {
      toast({
        title: "Select a member",
        description: "Choose a team member to assign this chat to.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      if (existingAssignment) {
        await api.put(
          API_CONFIG.ENDPOINTS.CONTACT_ASSIGNMENT_BY_ID(
            organizationId,
            existingAssignment.assignment_id
          ),
          {
            customer_id: customerId,
            assigned_to_user_id: targetTenantId,
            assigned_by_user_id: currentTenantId ?? targetTenantId,
          }
        );
      } else {
        await api.post(
          API_CONFIG.ENDPOINTS.CONTACT_ASSIGNMENTS(organizationId),
          {
            customer_id: customerId,
            assigned_to_user_id: targetTenantId,
            assigned_by_user_id: currentTenantId ?? targetTenantId,
            status: "assigned",
          }
        );
      }
      toast({
        title: "Assignment saved",
        description: customerName
          ? `${customerName} assigned successfully.`
          : "Chat assigned successfully.",
      });
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      console.error("[AssignChatDialog] error:", e?.response || e);
      toast({
        title: "Error",
        description:
          e?.response?.data?.detail ??
          e?.message ??
          "Failed to save assignment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (!existingAssignment) return;
    setSaving(true);
    try {
      await api.delete(
        API_CONFIG.ENDPOINTS.CONTACT_ASSIGNMENT_BY_ID(
          organizationId,
          existingAssignment.assignment_id
        )
      );
      toast({
        title: "Assignment removed",
        description: "The chat has been unassigned.",
      });
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      console.error("[AssignChatDialog] delete error:", e?.response || e);
      toast({
        title: "Error",
        description:
          e?.response?.data?.detail ??
          e?.message ??
          "Failed to remove assignment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingAssignment ? "Reassign chat" : "Assign chat"}
          </DialogTitle>
          <DialogDescription>
            {customerName
              ? `Assign ${customerName} to a team member.`
              : "Assign this chat to a team member."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Team member</label>
          <Select
            value={selectedTenantId}
            onValueChange={setSelectedTenantId}
            disabled={saving || members.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={String(m.tenant_id)}>
                  {m.email} — {m.permission}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {members.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No members in this organization yet.
            </p>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {existingAssignment && (
              <Button
                variant="destructive"
                onClick={handleUnassign}
                disabled={saving}
              >
                Unassign
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignChatDialog;