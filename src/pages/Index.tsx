import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { TagsSelect } from "@/components/tags/TagsSelect";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Formed For AI Studio</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6">
          <Card className="border-0 shadow-none">
            {/* Toolbar */}
            <div className="border-b border-border p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-lg font-semibold">Your Sculptures</h2>
                  <TagsSelect 
                    selectedTags={selectedTags} 
                    onTagsChange={setSelectedTags}
                    className="!mb-0" 
                  />
                </div>
                <Button 
                  onClick={() => setIsCreateSheetOpen(true)}
                  className="gap-2 shrink-0"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Sculpture
                </Button>
              </div>
            </div>
            <CardContent>
              <SculpturesList selectedTags={selectedTags} />
            </CardContent>
          </Card>
        </div>

        <CreateSculptureSheet 
          open={isCreateSheetOpen} 
          onOpenChange={setIsCreateSheetOpen}
        />
      </div>
    </div>
  );
}

export default Index;