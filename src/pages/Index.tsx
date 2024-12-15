import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Welcome{user?.email ? `, ${user.email}` : ''}</h1>
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is your dashboard. You're successfully logged in and can start building your application.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;