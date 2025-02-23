
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
      
      {/* Centered logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src="/your-logo.png" // Replace with your actual logo path
          alt="Formed For Logo"
          className="w-[400px] mix-blend-difference" // Adjust width as needed
        />
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
        <DialogContent className="sm:max-w-md bg-background">
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
