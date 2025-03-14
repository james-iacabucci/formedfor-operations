
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RequestQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fabricators: any[];
  onRequestSubmit: (fabricatorId: string, notes: string) => void;
}

export function RequestQuoteDialog({
  open,
  onOpenChange,
  fabricators,
  onRequestSubmit
}: RequestQuoteDialogProps) {
  const [fabricatorId, setFabricatorId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fabricatorId) return;
    
    setIsSubmitting(true);
    await onRequestSubmit(fabricatorId, notes);
    setIsSubmitting(false);
    
    // Reset form
    setFabricatorId("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Fabrication Quote</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fabricator">Fabricator</Label>
            <Select 
              value={fabricatorId}
              onValueChange={setFabricatorId}
            >
              <SelectTrigger id="fabricator">
                <SelectValue placeholder="Select a fabricator" />
              </SelectTrigger>
              <SelectContent>
                {fabricators?.map((fabricator) => (
                  <SelectItem key={fabricator.id} value={fabricator.id}>
                    {fabricator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any specific requirements or questions"
              className="min-h-[120px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!fabricatorId || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
