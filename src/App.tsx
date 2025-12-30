import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import ContactDetails from "./pages/ContactDetails";
import Deals from "./pages/Deals";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/contacts" element={<Contacts isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/contacts/:id" element={<ContactDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/deals" element={<Deals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/inventory" element={<Inventory isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/orders" element={<Orders isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/invoices" element={<Invoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/reports" element={<Reports isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/settings" element={<Settings isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;