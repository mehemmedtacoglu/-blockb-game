import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BlockBlast from "./pages/games/BlockBlast";
import Achievements from "./pages/Achievements";


function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Router />
          <Toaster />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/block-blast" component={BlockBlast} />
      <Route path="/achievements" component={Achievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
