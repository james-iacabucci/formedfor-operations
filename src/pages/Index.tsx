
import { useAuth } from "@/components/AuthProvider";
import { LandingPage } from "./LandingPage";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard />;
};

export default Index;
