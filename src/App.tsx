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
import Blog from "./pages/Blog.tsx";
import Jardin from "./pages/Jardin.tsx";
import ProjectINNOVA from "./pages/ProjectINNOVA.tsx";
import ProjectWASHMA from "./pages/ProjectWASHMA.tsx";
import ProjectCommandZ from "./pages/ProjectCommandZ.tsx";
import ProjectPatriaC from "./pages/ProjectPatriaC.tsx";
import ProjectLaHuaca from "./pages/ProjectLaHuaca.tsx";
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/jardin" element={<Jardin />} />
          <Route path="/lado-b" element={<LadoB />} />
          <Route path="/portafolio/innova-plus" element={<ProjectINNOVA />} />
          <Route path="/portafolio/washma" element={<ProjectWASHMA />} />
          <Route path="/portafolio/command-z" element={<ProjectCommandZ />} />
          <Route path="/portafolio/patria-c" element={<ProjectPatriaC />} />
          <Route path="/portafolio/la-huaca" element={<ProjectLaHuaca />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
