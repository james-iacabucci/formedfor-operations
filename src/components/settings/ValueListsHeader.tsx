
import { Separator } from "@/components/ui/separator";

export function ValueListsHeader() {
  return (
    <div className="sticky top-0 bg-background pt-4 z-10">
      <div>
        <h3 className="text-lg font-medium">Value Lists</h3>
        <p className="text-sm text-muted-foreground">
          Manage materials, finishes, fabricators, and textures for sculptures
        </p>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
