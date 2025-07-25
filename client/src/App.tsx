import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { usePerformanceOptimization } from "@/hooks/use-performance-optimization";
import { useColorScheme } from "@/hooks/use-color-scheme";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import BlogPost from "@/pages/blog-post";
import Portfolio from "@/pages/portfolio";
import AllBlog from "@/pages/all-blog";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Services from "@/pages/services";
import TooltipsDemo from "@/pages/tooltips-demo";

import ChatButton from "@/components/chatbot/chat-button";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/blog" component={AllBlog} />
      <Route path="/all-blog" component={AllBlog} />
      <Route path="/services" component={Services} />
      <Route path="/tooltips-demo" component={TooltipsDemo} />

      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Инициализируем оптимизацию производительности
  usePerformanceOptimization();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="tsvetokraft-theme">
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Component to initialize color scheme and render app content
function AppContent() {
  useColorScheme(); // Initialize color scheme
  const [location] = useLocation();
  
  // Hide chat button on admin pages
  const isAdminPage = location.startsWith('/admin');
  
  return (
    <>
      <Toaster />
      <Router />
      {!isAdminPage && <ChatButton />}
    </>
  );
}

export default App;
