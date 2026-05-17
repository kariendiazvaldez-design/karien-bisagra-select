import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import LadoA from "./pages/LadoA.tsx";
import LadoB from "./pages/LadoB.tsx";
import CaseStudy from "./pages/CaseStudy.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import ProjectINNOVA from "./pages/ProjectINNOVA.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lado-a" element={<LadoA />} />
          <Route path="/lado-a/proyecto/:slug" element={<CaseStudy />} />
          <Route path="/lado-a/blog/:slug" element={<BlogPost />} />
          <Route path="/lado-b" element={<LadoB />} />
          <Route path="/portafolio/innova-plus" element={<ProjectINNOVA />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
