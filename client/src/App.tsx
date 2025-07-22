import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
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

import ChatButton from "@/components/chatbot/chat-button";

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

      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="tsvetokraft-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatButton />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
