
import { useState } from "react";
import { MessageCircle, Plus, Tags, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { SculptureDetailImage } from "../SculptureDetailImage";
import { SculptureDescription } from "./SculptureDescription";
import { SculptureFiles } from "../SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/tasks/TaskList";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { format } from "date-fns";
import { SculpturePrompt } from "../SculpturePrompt";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { CreateTagForm } from "@/components/tags/CreateTagForm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const { toast } = useToast();
  const { hasPermission } = useUserRoles();
  const canManageTags = hasPermission('settings.manage_tags');

  // Use the tags management hook to handle tag operations
  const {
    tags: allTags,
    addTagMutation,
    removeTagMutation,
    createTagMutation
  } = useTagsManagement(sculpture.id);

  // Filter out already assigned tags
  const availableTags = allTags?.filter(tag => 
    !tags.some(existingTag => existingTag.id === tag.id)
  ) || [];

  const handleAddTag = (tagId: string) => {
    if (!tagId) return;
    
    addTagMutation.mutate(tagId, {
      onSuccess: () => {
        setSelectedTagId("");
        toast({
          title: "Success",
          description: "Tag added successfully"
        });
      }
    });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const handleCreateTag = (name: string) => {
    createTagMutation.mutate(name, {
      onSuccess: () => {
        setShowTagForm(false);
        toast({
          title: "Success",
          description: "Tag created and added successfully"
        });
      }
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative border rounded-lg overflow-hidden">
        <AspectRatio ratio={1}>
          <SculptureDetailImage
            imageUrl={sculpture.image_url || ""}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            sculptureId={sculpture.id}
            userId={sculpture.created_by}
            onRegenerate={onRegenerate}
            onManageTags={() => {
              toast({
                title: "Feature not implemented",
                description: "Tag management feature is not yet implemented.",
              });
            }}
          />
        </AspectRatio>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Discussion
        </Button>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-md border border-[#333333]">
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
          <SculptureFiles 
            sculptureId={sculpture.id}
            models={sculpture.models}
            renderings={sculpture.renderings}
            dimensions={sculpture.dimensions}
          />
        </TabsContent>
        <TabsContent value="tasks" className="w-full">
          <TaskList sculptureId={sculpture.id} />
        </TabsContent>
        <TabsContent value="tags" className="w-full">
          <div className="space-y-4">
            {canManageTags && (
              <div className="flex flex-col space-y-3">
                {showTagForm ? (
                  <CreateTagForm
                    onCreateTag={handleCreateTag}
                    onCancel={() => setShowTagForm(false)}
                    isSubmitting={createTagMutation.isPending}
                  />
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-2">
                      <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an existing tag" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTags.length > 0 ? (
                            availableTags.map((tag) => (
                              <SelectItem key={tag.id} value={tag.id}>
                                {tag.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No available tags
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddTag(selectedTagId)}
                        disabled={!selectedTagId || addTagMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTagForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create New Tag
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              {tags.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {tags.map((tag) => (
                    <div 
                      key={tag.id} 
                      className="bg-muted text-white px-3 py-2 rounded-md flex justify-between items-center"
                    >
                      <span>{tag.name}</span>
                      {canManageTags && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(tag.id)}
                        >
                          <span className="sr-only">Remove</span>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags assigned to this sculpture.</p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="details">
          <SculptureDescription 
            sculptureId={sculpture.id}
            imageUrl={sculpture.image_url}
            description={sculpture.ai_description}
            name={sculpture.ai_generated_name}
          />

          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">AI Settings</h2>
              <SculpturePrompt prompt={sculpture.prompt} />
              <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
                {sculpture.creativity_level && (
                  <div className="flex justify-between py-2 border-b">
                    <dt className="font-medium">Variation Creativity</dt>
                    <dd className="text-muted-foreground capitalize">
                      {sculpture.creativity_level}
                    </dd>
                  </div>
                )}
                <div className="flex py-2 border-b">
                  <dt className="font-medium">Created</dt>
                  <dd className="ml-4 text-muted-foreground">
                    {format(new Date(sculpture.created_at), "PPP")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ChatSheet
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        threadId={sculpture.id}
        sculptureId={sculpture.id}
      />
    </div>
  );
}
