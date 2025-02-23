
import { Button } from "@/components/ui/button";
import { DotCloud } from "@/components/landing/DotCloud";
import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-black relative">
      <DotCloud />
      
      {/* Logo text */}
      <div className="absolute top-6 left-6">
        <h1 className="text-white font-bold text-4xl">
          Formed For
        </h1>
      </div>

      {/* Sign in button */}
      <div className="absolute top-6 right-6">
        <Button
          onClick={() => setShowLogin(true)}
          variant="outline"
          className="bg-white text-black hover:bg-white/90"
        >
          Sign In
        </Button>
      </div>

      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome back</DialogTitle>
          </DialogHeader>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
