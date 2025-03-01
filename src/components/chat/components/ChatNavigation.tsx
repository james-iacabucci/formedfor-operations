
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Files } from "lucide-react";

interface ChatNavigationProps {
  activeView: "chat" | "files";
  onViewChange: (value: "chat" | "files") => void;
  currentTopic: "pricing" | "fabrication" | "operations";
  onTopicChange: (value: "pricing" | "fabrication" | "operations") => void;
}

export function ChatNavigation({ 
  activeView, 
  onViewChange, 
  currentTopic, 
  onTopicChange 
}: ChatNavigationProps) {
  return (
    <div className="border-b shrink-0 pb-4">
      <div className="flex items-start px-4 pt-4 flex-wrap gap-2">
        <div className="w-full flex items-center space-x-4">
          <Tabs
            value={activeView}
            onValueChange={(value) => onViewChange(value as "chat" | "files")}
            className="bg-black p-1.5 rounded-md border border-muted"
          >
            <TabsList className="bg-transparent border-0 h-7 p-0">
              <TabsTrigger 
                value="chat" 
                className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <MessageSquare className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="files" 
                className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Files className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs
            value={currentTopic}
            onValueChange={(value) => onTopicChange(value as "pricing" | "fabrication" | "operations")}
            className="bg-black p-1.5 rounded-md border border-muted flex-grow flex"
          >
            <TabsList className="bg-transparent border-0 h-7 p-0 w-full flex">
              <TabsTrigger 
                value="pricing" 
                className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-black flex-1"
              >
                Pricing
              </TabsTrigger>
              <TabsTrigger 
                value="fabrication" 
                className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-black flex-1"
              >
                Fabrication
              </TabsTrigger>
              <TabsTrigger 
                value="operations" 
                className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-black flex-1"
              >
                Operations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
