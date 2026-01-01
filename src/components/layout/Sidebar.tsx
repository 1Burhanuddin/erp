import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  LogOut,
  User,
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
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    path: "/contacts",
    label: "Contacts",
    icon: Users,
    children: [
      { path: "/contacts/suppliers", label: "Suppliers" },
      { path: "/contacts/customers", label: "Customers" },
      { path: "/contacts/ecommerce", label: "E-commerce" },
      { path: "/contacts/import", label: "Import Contacts" },
    ],
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
    children: [
      { path: "/products/list", label: "Products List" },
      { path: "/products/units", label: "Units" },
      { path: "/products/categories", label: "Category" },
      { path: "/products/sub-categories", label: "Sub Category" },
      { path: "/products/brands", label: "Brand" },
    ],
  },
  {
    path: "/purchase",
    label: "Purchase",
    icon: ShoppingCart,
    children: [
      { path: "/purchase/order", label: "Purchase Order" },
      { path: "/purchase/grn", label: "GRN" },
      { path: "/purchase/invoice", label: "Purchase Invoice" },
      { path: "/purchase/direct", label: "Direct Purchase" },
      { path: "/purchase/return", label: "Purchase Return" },
    ],
  },
  {
    path: "/sell",
    label: "Sell",
    icon: CreditCard,
    children: [
      { path: "/sales/quotations", label: "Quotations" },
      { path: "/sell/order", label: "Sales Order" },
      { path: "/sales/challans", label: "Delivery Challan" },
      { path: "/sell/invoice", label: "Sales Invoice" },
      { path: "/sell/direct", label: "Direct Sale" },
      { path: "/sell/return", label: "Sale Return" },
      { path: "/sell/ecommerce", label: "E-Commerce Sale" },
    ],
  },
  { path: "/stock/adjustment", label: "Stock Adjustment", icon: ClipboardList },
  {
    path: "/expenses",
    label: "Expenses",
    icon: Wallet,
    children: [
      { path: "/expenses/list", label: "Expenses" },
      { path: "/expenses/categories", label: "Expense Categories" },
    ],
  },
  { path: "/deals", label: "Deals", icon: PieChart },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/invoices", label: "Invoices", icon: FileText },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

const SidebarItem = ({ item, isCollapsed, onMobileClick }: { item: typeof navItems[0], isCollapsed: boolean, onMobileClick?: () => void }) => {
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
                <Icon className="h-5 w-5 flex-shrink-0" />
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
              <Icon className="h-5 w-5 flex-shrink-0" />
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
      <Icon className="h-5 w-5 flex-shrink-0" />
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

const UserProfile = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-foreground/5 cursor-pointer transition-colors border-t border-sidebar-foreground/10 mt-auto",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-sidebar-foreground truncate max-w-[120px]">
                  {user?.user_metadata?.full_name || "User"}
                </span>
                <span className="text-xs text-sidebar-muted truncate max-w-[120px]">
                  {user?.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side={isCollapsed ? "right" : "top"}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar border-r border-sidebar-foreground/10 w-72">
            <div className="flex flex-col h-full">
              <div className="flex items-center h-16 px-6 border-b border-sidebar-foreground/10">
                <h1 className="text-xl font-bold text-sidebar-foreground">ERP System</h1>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                  <SidebarItem key={item.path} item={item} isCollapsed={false} />
                ))}
              </nav>
              <div className="p-4">
                <UserProfile isCollapsed={false} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

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

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <UserProfile isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;