
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import { PageTransition } from "./components/layout/PageTransition";
import { useEffect } from "react";
import { cleanupClosedPortals } from "./lib/portalUtils";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SculptureDetail from "./pages/SculptureDetail";
import LeadsPage from "./pages/LeadsPage";
import OrdersPage from "./pages/OrdersPage";
import ChatsPage from "./pages/ChatsPage";
import ProductLinePage from "./pages/ProductLinePage";
import ClientsPage from "./pages/ClientsPage";
import TasksPage from "./pages/TasksPage";

// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      // Add these settings to help with navigation
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppWithCleanup() {
  // Global portal cleanup on route changes
  useEffect(() => {
    // Setup periodic cleanup of stale portals
    const cleanupInterval = setInterval(() => {
      cleanupClosedPortals('', '', 0);
    }, 5000);
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sculpture/:id"
        element={
          <ProtectedRoute>
            <PageTransition>
              <SculptureDetail />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <PageTransition>
              <LeadsPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <PageTransition>
              <OrdersPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <PageTransition>
              <ChatsPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <PageTransition>
              <ClientsPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <PageTransition>
              <TasksPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/productline/:productLineId"
        element={
          <ProtectedRoute>
            <PageTransition>
              <ProductLinePage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AppWithCleanup />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
