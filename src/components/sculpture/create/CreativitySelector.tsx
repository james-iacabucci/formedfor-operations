
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreativitySelectorProps {
  value: "low" | "medium" | "high";
  onChange: (value: "low" | "medium" | "high") => void;
}

export function CreativitySelector({ value, onChange }: CreativitySelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as typeof value)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="low">Low Creativity</TabsTrigger>
        <TabsTrigger value="medium">Medium Creativity</TabsTrigger>
        <TabsTrigger value="high">High Creativity</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
