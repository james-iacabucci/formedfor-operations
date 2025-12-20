
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
            className="rounded-full border border-border p-1"
          >
            <TabsList className="bg-transparent border-0 h-9 p-0">
              <TabsTrigger 
                value="chat" 
                className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="files" 
                className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              >
                <Files className="h-4 w-4 mr-2" />
                Files
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs
            value={currentTopic}
            onValueChange={(value) => onTopicChange(value as "pricing" | "fabrication" | "operations")}
            className="rounded-full border border-border p-1 flex-grow flex"
          >
            <TabsList className="bg-transparent border-0 h-9 p-0 w-full flex">
              <TabsTrigger 
                value="pricing" 
                className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
              >
                Pricing
              </TabsTrigger>
              <TabsTrigger 
                value="fabrication" 
                className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
              >
                Fabrication
              </TabsTrigger>
              <TabsTrigger 
                value="operations" 
                className="h-9 px-5 py-2 text-sm font-medium rounded-full text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
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
