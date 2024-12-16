import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signOut: async () => {} 
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session check:", session ? "Active session" : "No session");
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state change:", _event, session ? "Session exists" : "No session");
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log("Attempting to sign out...");
    
    try {
      // First clear the local state
      setUser(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only clear the current tab's session
      });
      
      if (error) {
        console.error("Sign out API error:", error);
        // Even if API fails, we continue with local cleanup
      }
      
      // Always navigate away and show success message
      console.log("Sign out completed, redirecting to login");
      navigate('/login');
      toast.success("Signed out successfully");
      
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      // Still navigate away on error
      navigate('/login');
      toast.error("An error occurred, but you've been signed out locally");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};