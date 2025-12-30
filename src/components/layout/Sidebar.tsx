import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/contacts", label: "Contacts", icon: Users },
  { path: "/deals", label: "Deals", icon: PieChart },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/orders", label: "Orders", icon: ShoppingCart },
  { path: "/invoices", label: "Invoices", icon: FileText },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const linkContent = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          isCollapsed && "justify-center px-2",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-foreground/10 z-50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-16 lg:w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-sidebar-foreground/10",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-sidebar-foreground hidden lg:block">
              ERP System
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground/10 hidden lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;