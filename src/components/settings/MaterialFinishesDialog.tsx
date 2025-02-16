
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ValueList {
  id: string;
  type: 'finish' | 'material' | 'fabricator' | 'texture';
  code: string | null;
  name: string;
  created_at: string;
}

interface MaterialFinishesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: ValueList | null;
  finishes: ValueList[];
  selectedFinishIds: string[];
  onFinishesUpdate: (finishIds: string[]) => void;
}

export function MaterialFinishesDialog({
  open,
  onOpenChange,
  material,
  finishes,
  selectedFinishIds,
  onFinishesUpdate,
}: MaterialFinishesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Select Valid Finishes for {material?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {finishes.map((finish) => (
            <div key={finish.id} className="flex items-center space-x-2">
              <Checkbox
                id={finish.id}
                checked={selectedFinishIds.includes(finish.id)}
                onCheckedChange={(checked) => {
                  const newSelectedFinishes = checked
                    ? [...selectedFinishIds, finish.id]
                    : selectedFinishIds.filter(id => id !== finish.id);
                  onFinishesUpdate(newSelectedFinishes);
                }}
              />
              <label
                htmlFor={finish.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {finish.name}
              </label>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
