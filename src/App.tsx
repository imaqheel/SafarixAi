import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Plan from "@/pages/plan";
import TripDetails from "@/pages/trip-details";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import MyTrips from "@/pages/my-trips";
import { AIChatWidget } from "@/components/ui/ai-chat-widget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/my-trips" component={MyTrips} />
      <Route path="/plan" component={Plan} />
      <Route path="/trip/:id" component={TripDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { CustomCursor } from "@/components/ui/custom-cursor";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <CustomCursor />
            <Router />
            <AIChatWidget />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
