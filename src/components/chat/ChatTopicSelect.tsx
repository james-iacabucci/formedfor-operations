
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, MessageSquare, Wrench } from "lucide-react"

interface ChatTopicSelectProps {
  value: string;
  onValueChange: (value: "pricing" | "fabrication" | "operations") => void;
}

export function ChatTopicSelect({ value, onValueChange }: ChatTopicSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select chat topic" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pricing">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Pricing Discussion</span>
          </div>
        </SelectItem>
        <SelectItem value="fabrication">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Fabrication Details</span>
          </div>
        </SelectItem>
        <SelectItem value="operations">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>Operations</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
