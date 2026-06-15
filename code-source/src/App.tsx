import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnalyticsConsent from "./components/AnalyticsConsent";
import Index from "./pages/Index";
import ConditionsUtilisation from "./pages/ConditionsUtilisation";
import MentionsLegales from "./pages/MentionsLegales";
import NotFound from "./pages/NotFound";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cgu" element={<ConditionsUtilisation />} />
          <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <AnalyticsConsent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
