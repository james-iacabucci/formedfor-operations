
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SculptureHeader } from "../SculptureHeader";
import { Sculpture } from "@/types/sculpture";

interface SculptureDetailHeaderProps {
  sculpture: Sculpture;
}

export function SculptureDetailHeader({ sculpture }: SculptureDetailHeaderProps) {
  return (
    <div className="sticky top-0 bg-background z-10 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant="outline"
              size="icon"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="text-2xl font-bold">
            {sculpture.ai_generated_name || "Untitled Sculpture"}
          </div>
        </div>
        <SculptureHeader sculpture={sculpture} />
      </div>
    </div>
  );
}
