import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateTagFormProps {
  onCreateTag: (name: string) => void;
  onCancel: () => void;
}

export function CreateTagForm({ onCreateTag, onCancel }: CreateTagFormProps) {
  const [newTagName, setNewTagName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onCreateTag(newTagName);
    setNewTagName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Input
          placeholder="Enter tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="h-8"
        />
        <p className="text-xs text-muted-foreground">
          Tags help you organize and filter your sculptures
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-8">
          Create Tag
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          size="sm"
          className="h-8"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}