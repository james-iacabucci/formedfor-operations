
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SculptureDetail from "./pages/SculptureDetail";
import SculptureDetailTabbed from "./pages/SculptureDetailTabbed";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sculpture/:id"
                element={
                  <ProtectedRoute>
                    <SculptureDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sculpture/:id/tabs"
                element={
                  <ProtectedRoute>
                    <SculptureDetailTabbed />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
