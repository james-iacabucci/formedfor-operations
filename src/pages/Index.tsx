import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SculpturesList } from "@/components/SculpturesList";
import { CreateSculptureSheet } from "@/components/CreateSculptureSheet";
import { useState } from "react";
import { PlusIcon } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Welcome{user?.email ? `, ${user.email}` : ''}</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateSheetOpen(true)}
              className="gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create Sculpture
            </Button>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Your Sculptures</CardTitle>
            </CardHeader>
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
};

export default Index;