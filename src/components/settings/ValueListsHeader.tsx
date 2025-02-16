
import { Separator } from "@/components/ui/separator";

export function ValueListsHeader() {
  return (
    <>
      <div>
        <h3 className="text-lg font-medium">Value Lists</h3>
        <p className="text-sm text-muted-foreground">
          Manage materials, finishes, fabricators, and textures for sculptures
        </p>
      </div>
      <Separator />
    </>
  );
}
