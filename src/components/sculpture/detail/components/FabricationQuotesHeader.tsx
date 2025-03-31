
import { Button } from "@/components/ui/button";
import { PlusIcon, MessagesSquareIcon } from "lucide-react";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";

interface FabricationQuotesHeaderProps {
  onAddQuote: () => void;
  onOpenChat: () => void;
  disabled?: boolean;
}

export function FabricationQuotesHeader({ onAddQuote, onOpenChat, disabled = false }: FabricationQuotesHeaderProps) {
  const { role } = useUserRoles();
  
  // Only admin and sales roles can create new quotes
  const canCreateQuotes = role === 'admin' || role === 'sales';
  
  return (
    <div className="flex items-center justify-between pb-2">
      <h2 className="text-xl font-semibold">Fabrication Quotes</h2>
      <div className="flex gap-2">
        <PermissionGuard requiredPermission="quote_chat.view">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={onOpenChat}
            disabled={disabled}
          >
            <MessagesSquareIcon className="h-4 w-4" />
            Chat
          </Button>
        </PermissionGuard>
        
        {canCreateQuotes && (
          <PermissionGuard requiredPermission="quote.create">
            <Button
              size="sm"
              className="flex items-center gap-1"
              onClick={onAddQuote}
              disabled={disabled}
            >
              <PlusIcon className="h-4 w-4" />
              Request Quote
            </Button>
          </PermissionGuard>
        )}
      </div>
    </div>
  );
}
