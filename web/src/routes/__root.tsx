import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <FinanceProvider>
            <Sonner />
            <Outlet />
          </FinanceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  ),
});
