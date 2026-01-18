import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, type ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  PieChart,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  FileText,
  ChevronDown,
  CreditCard,
  ClipboardList,
  Wallet,
  Menu,
  User,
  History,
  Wrench,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, description: "Welcome back! Here's your overview." },
  {
    path: "/contacts",
    label: "Contacts",
    icon: Users,
    children: [
      { path: "/contacts/suppliers", label: "Suppliers", description: "Manage your supplier database" },
      { path: "/contacts/customers", label: "Customers", description: "Manage your customer database" },
      { path: "/contacts/ecommerce", label: "E-commerce", description: "Manage e-commerce customers" },
      { path: "/contacts/import", label: "Import Contacts", description: "Import contacts from file" },
    ],
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
    children: [
      { path: "/products/list", label: "Products List", description: "Manage your product catalog" },
      { path: "/products/units", label: "Units", description: "Manage product units" },
      { path: "/products/categories", label: "Category", description: "Manage product categories" },
      { path: "/products/sub-categories", label: "Sub Category", description: "Manage sub categories" },
      { path: "/products/brands", label: "Brand", description: "Manage product brands" },
    ],
  },
  { path: "/services", label: "Services", icon: Wrench, description: "Manage services" },
  {
    path: "/purchase",
    label: "Purchase",
    icon: ShoppingCart,
    children: [
      { path: "/purchase/order", label: "Purchase Order", description: "Manage purchase orders" },
      { path: "/purchase/grn", label: "GRN", description: "Goods Received Note" },
      { path: "/purchase/invoice", label: "Purchase Invoice", description: "Manage purchase invoices" },
      { path: "/purchase/direct", label: "Direct Purchase", description: "Manage direct purchases" },
      { path: "/purchase/return", label: "Purchase Return", description: "Manage purchase returns" },
    ],
  },
  {
    path: "/sell",
    label: "Sell",
    icon: CreditCard,
    children: [
      { path: "/sales/quotations", label: "Quotations", description: "Manage sales quotations" },
      { path: "/sell/order", label: "Sales Order", description: "Manage sales orders" },
      { path: "/sales/challans", label: "Delivery Challan", description: "Manage delivery challans" },
      { path: "/sell/invoice", label: "Sales Invoice", description: "Manage sales invoices" },
      { path: "/sell/direct", label: "Direct Sale", description: "Manage direct sales" },
      { path: "/sell/return", label: "Sale Return", description: "Manage sale returns" },
      { path: "/sell/ecommerce", label: "E-Commerce Sale", description: "Manage e-commerce sales" },
      { path: "/sell/bookings", label: "Web Bookings", description: "Manage service requests" },
    ],
  },
  { path: "/stock/adjustment", label: "Stock Adjustment", icon: ClipboardList, description: "Manage stock adjustments" },
  {
    path: "/expenses",
    label: "Expenses",
    icon: Wallet,
    children: [
      { path: "/expenses/list", label: "Expenses", description: "Manage expenses" },
      { path: "/expenses/categories", label: "Expense Categories", description: "Manage expense categories" },
    ],
  },
  { path: "/deals", label: "Deals", icon: PieChart, description: "Manage your deals" },
  { path: "/reports", label: "Reports", icon: BarChart3, description: "View reports and analytics" },
  { path: "/audit-logs", label: "Audit Logs", icon: History, description: "View audit trail and changes" },
  { path: "/settings?tab=profile", label: "Profile", icon: User, description: "Manage your profile" },
  { path: "/settings?tab=app", label: "Settings", icon: Settings, description: "App configuration" },
];

// Helper function to get page title from path
export const getPageTitle = (pathname: string): { title: string; description?: string } => {
  // Check top-level items
  for (const item of navItems) {
    if (item.path === pathname) {
      return { title: item.label, description: item.description };
    }
    // Check children
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) {
          return { title: child.label, description: child.description };
        }
      }
    }
  }
  // Handle dynamic routes
  if (pathname.startsWith('/products/add')) return { title: 'Add Product', description: 'Create a new product' };
  if (pathname.startsWith('/products/edit')) return { title: 'Edit Product', description: 'Update product details' };
  if (pathname.startsWith('/contacts/add')) return { title: 'Add Contact', description: 'Create a new contact' };
  if (pathname.startsWith('/contacts/edit')) return { title: 'Edit Contact', description: 'Update contact details' };
  if (pathname.startsWith('/contacts/')) return { title: 'Contact Details', description: 'View contact information' };
  if (pathname.startsWith('/services/add')) return { title: 'Add Service', description: 'Create a new service' };
  if (pathname.startsWith('/services/edit')) return { title: 'Edit Service', description: 'Update service details' };
  if (pathname.startsWith('/purchase/order/add')) return { title: 'Add Purchase Order', description: 'Create a new purchase order' };
  if (pathname.startsWith('/sell/invoice/add')) return { title: 'Add Sales Invoice', description: 'Create a new sales invoice' };
  if (pathname.startsWith('/sell/invoice/')) return { title: 'Invoice Details', description: 'View invoice details' };
  if (pathname.startsWith('/sales/quotations/add')) return { title: 'Add Quotation', description: 'Create a new quotation' };
  if (pathname.startsWith('/sales/quotations/edit')) return { title: 'Edit Quotation', description: 'Update quotation' };
  if (pathname.startsWith('/sales/challans/add')) return { title: 'Add Delivery Challan', description: 'Create a delivery challan' };
  if (pathname.startsWith('/sales/challans/edit')) return { title: 'Edit Delivery Challan', description: 'Update delivery challan' };
  if (pathname.startsWith('/expenses/add')) return { title: 'Add Expense', description: 'Record a new expense' };
  if (pathname.startsWith('/expenses/edit')) return { title: 'Edit Expense', description: 'Update expense details' };
  if (pathname.startsWith('/stock/adjustment/add')) return { title: 'Add Stock Adjustment', description: 'Create stock adjustment' };
  if (pathname.startsWith('/stock/adjustment/edit')) return { title: 'Edit Stock Adjustment', description: 'Update stock adjustment' };
  if (pathname.startsWith('/sell/return/add')) return { title: 'Add Sale Return', description: 'Create a sale return' };
  if (pathname.startsWith('/sell/return/edit')) return { title: 'Edit Sale Return', description: 'Update sale return' };

  return { title: 'ERP System', description: '' };
};

type NavItem = {
  path: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children?: Array<{ path: string; label: string; description?: string }>;
};

const SidebarItem = ({ item, isCollapsed, onMobileClick }: { item: NavItem, isCollapsed: boolean, onMobileClick?: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const Icon = item.icon;
  const active = isActive(item.path) || (item.children && item.children.some(child => isActive(child.path)));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (active) setIsOpen(true);
  }, [active]);

  if (item.children) {
    if (isCollapsed) {
      return (
        <div className="relative">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 justify-center cursor-pointer",
                active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
              )}>
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
              </div>
            </TooltipTrigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="absolute inset-0 z-10" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-56" align="start">
                <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {item.children.map(child => (
                  <Link key={child.path} to={child.path} onClick={onMobileClick}>
                    <DropdownMenuItem className={cn(isActive(child.path) && "bg-accent")}>
                      {child.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </div>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
            active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
          )}>
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1 mt-1 overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          {item.children.map(child => (
            <Link key={child.path} to={child.path} onClick={onMobileClick} className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
              isActive(child.path) ? "bg-sidebar-accent/10 text-sidebar-accent" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/5"
            )}>
              <span>{child.label}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const linkContent = (
    <Link
      to={item.path}
      onClick={onMobileClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        isCollapsed && "justify-center px-2",
        active
          ? "bg-sidebar-accent text-sidebar-primary-foreground"
          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
      )}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
};



export const SidebarMobileContent = () => {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center h-16 px-6 border-b border-sidebar-foreground/10">
        <h1 className="text-xl font-bold text-sidebar-foreground">ERP System</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar pb-6">
        {navItems.map((item) => (
          <SidebarItem key={item.path} item={item as NavItem} isCollapsed={false} />
        ))}
      </nav>
    </div>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  return (
    <>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-foreground/10 z-50 transition-all duration-300 flex-col",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-foreground/10 flex-shrink-0",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-sidebar-foreground">
              ERP System
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/10", isCollapsed && "mx-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar pb-4">
          {navItems.map((item) => (
            <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;