import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateTagFormProps {
  onCreateTag: (name: string) => void;
  onCancel: () => void;
}

export function CreateTagForm({ onCreateTag, onCancel }: CreateTagFormProps) {
  const [newTagName, setNewTagName] = useState("");

  const handleSubmit = () => {
    if (!newTagName.trim()) return;
    onCreateTag(newTagName);
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="New tag name"
        value={newTagName}
        onChange={(e) => setNewTagName(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={handleSubmit}>Create and Add</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}