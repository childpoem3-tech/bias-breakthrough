import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Consent from "./pages/Consent";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";
import CoordinatesGame from "./pages/CoordinatesGame";
import FactorsGame from "./pages/FactorsGame";
import SequencesGame from "./pages/SequencesGame";
import PermutationsGame from "./pages/PermutationsGame";
import CombinationsGame from "./pages/CombinationsGame";
import ProbabilityGame from "./pages/ProbabilityGame";
import RacingGame from "./pages/RacingGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/research" element={<AdminPortal />} />
            <Route path="/coordinates" element={<CoordinatesGame />} />
            <Route path="/factors" element={<FactorsGame />} />
            <Route path="/sequences" element={<SequencesGame />} />
            <Route path="/permutations" element={<PermutationsGame />} />
            <Route path="/combinations" element={<CombinationsGame />} />
            <Route path="/probability" element={<ProbabilityGame />} />
            <Route path="/racing" element={<RacingGame />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
