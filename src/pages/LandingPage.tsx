
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
  DialogDescription,
} from "@/components/ui/dialog";

export const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-black relative">
      <DotCloud />
      
      {/* Centered logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src="/lovable-uploads/1d896fe1-615b-480a-afe2-43eb55e0c16f.png"
          alt="Formed For Logo"
          className="w-[300px] mix-blend-difference"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome back</DialogTitle>
            <DialogDescription>
              Sign in to your account to continue
            </DialogDescription>
          </DialogHeader>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#404040',
                    inputBackground: 'white',
                    inputText: 'black',
                  }
                }
              }
            }}
            theme="light"
            providers={[]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
