
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
import Orders from "./pages/Orders";
import ChatLogs from "./pages/ChatLogs";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

// Layout component for authenticated routes
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Authentication check wrapper component
const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Check for token in localStorage
  const token = localStorage.getItem('access_token');
  const isAuthenticated = !!token;

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
          <Route path="/orders" element={<AuthenticatedRoute><Orders /></AuthenticatedRoute>} />
          <Route path="/chat-logs" element={<AuthenticatedRoute><ChatLogs /></AuthenticatedRoute>} />
          <Route path="/settings" element={<AuthenticatedRoute><Settings /></AuthenticatedRoute>} />
          <Route path="/integrations" element={<AuthenticatedRoute><Integrations /></AuthenticatedRoute>} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
