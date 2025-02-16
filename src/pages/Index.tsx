
import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { AddSculptureSheet } from "@/components/AddSculptureSheet";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { TagsSelect } from "@/components/tags/TagsSelect";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "lucide-react";

const Index = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-bold shrink-0">Sculptify</h1>
            <div className="flex items-center gap-4 ml-auto">
              <Button 
                onClick={() => setIsAddSheetOpen(true)}
                variant="outline"
                className="gap-2 shrink-0"
              >
                <UploadIcon className="h-4 w-4" />
                Add
              </Button>
              <Button 
                onClick={() => setIsCreateSheetOpen(true)}
                className="gap-2 shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
                Create
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 pt-6">
        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <SculpturesList selectedTags={selectedTags} />
          </CardContent>
        </Card>
      </div>

      <CreateSculptureSheet 
        open={isCreateSheetOpen} 
        onOpenChange={setIsCreateSheetOpen}
      />
      <AddSculptureSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
    </div>
  );
}

export default Index;
