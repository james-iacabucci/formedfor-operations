import { Card, CardContent } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

const Index = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Formed For Design</h1>
          <UserMenu />
        </div>

        <div className="grid gap-6">
          <Card>
            {/* Toolbar */}
            <div className="border-b border-border p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your Sculptures</h2>
                <Button 
                  onClick={() => setIsCreateSheetOpen(true)}
                  className="gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Sculpture
                </Button>
              </div>
            </div>
            <CardContent>
              <SculpturesList />
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