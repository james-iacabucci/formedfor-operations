
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { CheckIcon, PenIcon, XIcon, RefreshCwIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionAction } from "@/types/permissions";

interface EditableFieldProps {
  value: string;
  type: "input" | "textarea" | "select" | "number";
  sculptureId: string;
  field: "name" | "ai_description" | "status" | "height_in" | "width_in" | "depth_in";
  className?: string;
  label?: string;
  options?: Array<{ value: string; label: string }>;
  hideControls?: boolean;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  requiredPermission?: PermissionAction;
}

export interface EditableFieldRef {
  save: () => Promise<void>;
}

export const EditableField = forwardRef<EditableFieldRef, EditableFieldProps>(({ 
  value, 
  type, 
  sculptureId, 
  field, 
  className = "", 
  label,
  options = [],
  hideControls = false,
  isEditing: controlledEditing,
  onEditingChange,
  requiredPermission = "sculpture.edit"
}, ref) => {
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const isEditing = controlledEditing ?? isInternalEditing;
  const setIsEditing = onEditingChange ?? setIsInternalEditing;

  const [editedValue, setEditedValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useUserRoles();
  const canEdit = hasPermission(requiredPermission);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const handleUpdate = async () => {
    if (editedValue === value) {
      setIsEditing(false);
      return;
    }

    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this field",
        variant: "destructive",
      });
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      let finalValue = editedValue;
      if (type === "number") {
        finalValue = finalValue ? parseFloat(finalValue).toString() : null;
      }

      const { error } = await supabase
        .from('sculptures')
        .update({ [field]: finalValue })
        .eq('id', sculptureId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });

      toast({
        title: "Success",
        description: "Updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating sculpture:', error);
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleUpdate
  }));

  if (isEditing) {
    return (
      <div className="w-full rounded-md border bg-background p-1">
        {type === "select" ? (
          <Select
            value={editedValue}
            onValueChange={(value) => {
              setEditedValue(value);
              setIsEditing(false);
              handleUpdate();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === "textarea" ? (
          <Textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="w-full text-base leading-relaxed min-h-[200px] bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-4 py-3"
            placeholder={`Enter ${label || 'description'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleUpdate();
              }
            }}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type={type === "number" ? "number" : "text"}
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="flex-1"
              placeholder={`Enter ${label || 'value'}`}
              autoFocus
            />
          </div>
        )}
      </div>
    );
  }

  const displayValue = type === "number" && value ? parseFloat(value).toString() : value;

  return (
    <div className="group relative" data-field={field}>
      <div 
        className={`${className}`}
        onClick={() => !hideControls && canEdit && setIsEditing(true)}
        style={{ cursor: (!hideControls && canEdit) ? 'pointer' : 'text' }}
      >
        {label ? (
          <Input
            type="text"
            value={displayValue}
            className={`${canEdit ? 'cursor-pointer' : 'cursor-text'}`}
            readOnly
            placeholder={label}
          />
        ) : (
          displayValue
        )}
      </div>
      {!hideControls && !isEditing && canEdit && (
        <div className="absolute -right-16 top-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Edit"
          >
            <PenIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

EditableField.displayName = "EditableField";
