import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import QuickSupport from "./pages/QuickSupport";
import Academy from "./pages/Academy";
import LMS from "./pages/LMS";
import Internship from "./pages/Internship";
import Placement from "./pages/Placement";
import Projects from "./pages/Projects";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import TrackTicket from "./pages/TrackTicket";
import AdminAuth from "./pages/AdminAuth";
import AdminTickets from "./pages/AdminTickets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/quick-support" element={<QuickSupport />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/lms" element={<LMS />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/placement" element={<Placement />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track" element={<TrackTicket />} />
            <Route path="/track/:ref" element={<TrackTicket />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
