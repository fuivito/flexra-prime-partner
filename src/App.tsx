import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrokerLogin from "./pages/broker/BrokerLogin";
import PortalLogin from "./pages/portal/PortalLogin";
import BrokerLayout from "./layouts/BrokerLayout";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerClients from "./pages/broker/BrokerClients";
import ClientProfile from "./pages/broker/ClientProfile";
import DealBuilder from "./pages/broker/DealBuilder";
import AgreementDetail from "./pages/broker/AgreementDetail";
import BrokerAgreements from "./pages/broker/BrokerAgreements";
import PortalLayout from "./layouts/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalPayments from "./pages/portal/PortalPayments";
import PortalProfile from "./pages/portal/PortalProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/broker/login" element={<BrokerLogin />} />
            <Route path="/portal/login" element={<PortalLogin />} />

            {/* Broker Portal */}
            <Route path="/broker" element={<ProtectedRoute requiredRole="broker"><BrokerLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<BrokerDashboard />} />
              <Route path="clients" element={<BrokerClients />} />
              <Route path="clients/:id" element={<ClientProfile />} />
              <Route path="deals/new" element={<DealBuilder />} />
              <Route path="agreements" element={<BrokerAgreements />} />
              <Route path="agreements/:id" element={<AgreementDetail />} />
            </Route>

            {/* Policyholder Portal */}
            <Route path="/portal" element={<ProtectedRoute requiredRole="policyholder"><PortalLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="payments" element={<PortalPayments />} />
              <Route path="profile" element={<PortalProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
