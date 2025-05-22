
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AgentManagement from "./pages/AgentManagement";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import ChatLogs from "./pages/ChatLogs";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

// Layout component for authenticated routes
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Authentication check wrapper component
const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  // In a real app, you would check if the user is authenticated here
  // For demo purposes, we'll always allow access
  const isAuthenticated = true;
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
          <Route path="/agent-management" element={<AuthenticatedRoute><AgentManagement /></AuthenticatedRoute>} />
          <Route path="/customers" element={<AuthenticatedRoute><Customers /></AuthenticatedRoute>} />
          <Route path="/products" element={<AuthenticatedRoute><Products /></AuthenticatedRoute>} />
          <Route path="/chat-logs" element={<AuthenticatedRoute><ChatLogs /></AuthenticatedRoute>} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
