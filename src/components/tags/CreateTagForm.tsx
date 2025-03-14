
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreateTagFormProps {
  onCreateTag: (name: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateTagForm({ onCreateTag, onCancel, isSubmitting = false }: CreateTagFormProps) {
  const [tagName, setTagName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      onCreateTag(tagName.trim());
      setTagName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <Input
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
        placeholder="Enter tag name"
        className="flex-1"
        disabled={isSubmitting}
        autoFocus
      />
      <Button 
        type="submit" 
        size="sm"
        disabled={!tagName.trim() || isSubmitting}
        className="gap-1"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Tag"}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
    </form>
  );
}
