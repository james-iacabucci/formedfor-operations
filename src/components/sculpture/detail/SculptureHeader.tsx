import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SculptureHeader() {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      className="mb-6"
      onClick={() => navigate("/")}
    >
      <ChevronLeftIcon className="w-4 h-4 mr-2" />
      Back to Gallery
    </Button>
  );
}