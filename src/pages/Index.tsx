import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSculptureForm } from "@/components/CreateSculptureForm";
import { SculpturesList } from "@/components/SculpturesList";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Welcome{user?.email ? `, ${user.email}` : ''}</h1>
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Sculpture</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateSculptureForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Sculptures</CardTitle>
            </CardHeader>
            <CardContent>
              <SculpturesList />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;