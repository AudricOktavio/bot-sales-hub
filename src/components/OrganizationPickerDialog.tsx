import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Organization,
  useOrganization,
} from "@/context/OrganizationContext";

interface Props {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the dialog can be dismissed without picking. */
  dismissible?: boolean;
}

const OrganizationPickerDialog = ({
  open,
  onOpenChange,
  dismissible = false,
}: Props) => {
  const { organizations, selectedOrg, selectOrganization } = useOrganization();
  const [pending, setPending] = useState<Organization | null>(selectedOrg);

  const handleConfirm = () => {
    if (!pending) return;
    selectOrganization(pending);
    onOpenChange?.(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !dismissible) return; // block dismiss
        onOpenChange?.(next);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (!dismissible) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!dismissible) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Choose an organization</DialogTitle>
          <DialogDescription>
            Select the organization you want to work in. You can switch anytime
            from the top bar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[50vh] overflow-auto py-2">
          {organizations.map((org) => {
            const active = pending?.id === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => setPending(org)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-md border p-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {org.permission}
                    </div>
                  </div>
                </div>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}

          {organizations.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">
              You are not a member of any organization.
            </div>
          )}
        </div>

        <DialogFooter>
          {dismissible && (
            <Button variant="ghost" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={handleConfirm} disabled={!pending}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationPickerDialog;