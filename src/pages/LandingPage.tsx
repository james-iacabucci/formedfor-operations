
import { Button } from "@/components/ui/button";
import { DotCloud } from "@/components/landing/DotCloud";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative">
      <DotCloud />
      <div className="absolute top-6 right-6">
        <Button
          onClick={() => navigate("/login")}
          variant="outline"
          className="bg-white text-black hover:bg-white/90"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};
