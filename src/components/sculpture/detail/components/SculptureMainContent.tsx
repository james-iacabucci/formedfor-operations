
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sculpture } from "@/types/sculpture";
import { useToast } from "@/hooks/use-toast";
import { SculptureImageSection } from "./SculptureImageSection";
import { FilesTabContent } from "./tabs/FilesTabContent";
import { TasksTabContent } from "./tabs/TasksTabContent";
import { TagsTabContent } from "./tabs/TagsTabContent";
import { DetailsTabContent } from "./tabs/DetailsTabContent";

interface SculptureMainContentProps {
  sculpture: Sculpture;
  isRegenerating: boolean;
  onRegenerate: () => Promise<void>;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureMainContent({ 
  sculpture, 
  isRegenerating, 
  onRegenerate,
  tags
}: SculptureMainContentProps) {
  const { toast } = useToast();

  const handleManageTags = () => {
    toast({
      title: "Feature not implemented",
      description: "Tag management feature is not yet implemented.",
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <SculptureImageSection
        sculptureId={sculpture.id}
        imageUrl={sculpture.image_url}
        prompt={sculpture.prompt}
        isRegenerating={isRegenerating}
        userId={sculpture.created_by}
        onRegenerate={onRegenerate}
        onManageTags={handleManageTags}
      />

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-md border border-border">
          <TabsTrigger 
            value="files"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Files
          </TabsTrigger>
          <TabsTrigger 
            value="tasks"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="tags"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Tags
          </TabsTrigger>
          <TabsTrigger 
            value="details"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <FilesTabContent 
            sculptureId={sculpture.id}
            models={sculpture.models}
            renderings={sculpture.renderings}
            dimensions={sculpture.dimensions}
          />
        </TabsContent>
        
        <TabsContent value="tasks" className="w-full">
          <TasksTabContent sculptureId={sculpture.id} />
        </TabsContent>
        
        <TabsContent value="tags" className="w-full">
          <TagsTabContent 
            sculptureId={sculpture.id}
            tags={tags}
          />
        </TabsContent>
        
        <TabsContent value="details">
          <DetailsTabContent 
            sculptureId={sculpture.id}
            imageUrl={sculpture.image_url}
            description={sculpture.ai_description}
            name={sculpture.ai_generated_name}
            prompt={sculpture.prompt}
            creativityLevel={sculpture.creativity_level}
            createdAt={sculpture.created_at}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
