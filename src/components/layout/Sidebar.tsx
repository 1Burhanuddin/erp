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
  Smartphone,
  Contact,
  ArchiveX
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
import { useAppSelector } from "@/store/hooks";
import {
  Building2,
  Store,
  Receipt,
  UsersRound,
  BriefcaseBusiness,
  CheckCircle2
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

type NavItem = {
  path: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children?: Array<{ path: string; label: string; description?: string }>;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard, description: "Welcome back! Here's your overview." },
      { path: "/deals", label: "Deals", icon: PieChart, description: "Manage your deals" },
      {
        path: "/reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          { path: "/reports/profit-loss", label: "Profit & Loss", description: "Financial health summary" },
          { path: "/reports/gst", label: "GST Reports", description: "GSTR-1 & 3B" },
          { path: "/reports/stock", label: "Stock Valuation", description: "Inventory valuation & alerts" },
          { path: "/reports/expenses", label: "Expense Breakdown", description: "Operational costs analysis" },
          { path: "/reports", label: "General Reports", description: "Analytics and insights" },
        ]
      },
      { path: "/stock/adjustment", label: "Stock Adjustment", icon: ClipboardList, description: "Manage stock adjustments" },
    ]
  },
  {
    title: "SALES & FINANCE",
    items: [
      {
        path: "/sell",
        label: "Sales",
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
        path: "/expenses",
        label: "Expenses",
        icon: Wallet,
        children: [
          { path: "/expenses/list", label: "Expenses", description: "Manage expenses" },
          { path: "/expenses/categories", label: "Expense Categories", description: "Manage expense categories" },
        ],
      },
    ]
  },
  {
    title: "OPERATIONS",
    items: [
      {
        path: "/contacts",
        label: "Contacts",
        icon: Contact,
        children: [
          { path: "/contacts/suppliers", label: "Suppliers", description: "Manage your supplier database" },
          { path: "/contacts/customers", label: "Customers", description: "Manage your customer database" },
          { path: "/contacts/ecommerce", label: "E-commerce", description: "Manage e-commerce customers" },
          { path: "/contacts/import", label: "Import Contacts", description: "Import contacts from file" },
        ],
      },
      { path: "/inventory", label: "Inventory", icon: ClipboardList, description: "Manage inventory stock" },
      {
        path: "/products",
        label: "Products",
        icon: Package,
        children: [
          { path: "/products/list", label: "Products List", description: "Manage your product catalog" },
          { path: "/products/categories", label: "Category", description: "Manage product categories" },
          { path: "/products/sub-categories", label: "Sub Category", description: "Manage sub categories" },
          { path: "/products/brands", label: "Brand", description: "Manage product brands" },
          { path: "/products/units", label: "Units", description: "Manage product units" },
        ],
      },
      { path: "/services", label: "Services", icon: Wrench, description: "Manage services" },
    ]
  },
  {
    title: "TEAM",
    items: [
      {
        path: "/employees",
        label: "Employees",
        icon: Users,
        children: [
          { path: "/employees/list", label: "All Employees", description: "Manage staff profiles" },
          { path: "/employees/tasks", label: "Tasks Board", description: "Assign and track tasks" },
          { path: "/employees/live", label: "Live Status", description: "Real-time activity" },
          { path: "/employees/performance", label: "Performance", description: "Productivity metrics" },
          { path: "/employees/attendance", label: "Attendance Log", description: "View daily attendance" },
        ]
      },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { path: "/audit-logs", label: "Audit Logs", icon: History, description: "View audit trail and changes" },
      { path: "/settings/profile", label: "Profile", icon: User, description: "Manage your profile" },
      { path: "/settings", label: "Settings", icon: Settings, description: "App configuration" },
      { path: "/mobile/dashboard", label: "Mobile App", icon: Smartphone, description: "Switch to Employee View" },
    ]
  }
];

const navItems = navGroups.flatMap(g => g.items);

type ModulePlan = "FULL_ERP" | "BILLING_ONLY" | "HR_ONLY" | "ECOMMERCE";

// Mock plans for demonstration - in real app this comes from Supabase `subscriptions` table
const DEMO_PLANS: { id: ModulePlan, name: string, icon: any, desc: string }[] = [
  { id: "FULL_ERP", name: "Enterprise ERP", icon: Building2, desc: "All modules unlocked" },
  { id: "BILLING_ONLY", name: "Basic Billing", icon: Receipt, desc: "Invoices, Quotes, Customers" },
  { id: "HR_ONLY", name: "HR & Payroll", icon: UsersRound, desc: "Employees & Attendance" },
  { id: "ECOMMERCE", name: "E-Commerce", icon: Store, desc: "Online Store & Inventory" },
];

const getFilteredNavGroups = (plan: ModulePlan): NavGroup[] => {
  if (plan === "FULL_ERP") return navGroups;

  let allowedPaths: string[] = [];

  switch (plan) {
    case "BILLING_ONLY":
      allowedPaths = ["/", "/sell", "/contacts", "/reports", "/settings", "/mobile/dashboard"];
      break;
    case "HR_ONLY":
      allowedPaths = ["/", "/employees", "/settings", "/mobile/dashboard"];
      break;
    case "ECOMMERCE":
      allowedPaths = ["/", "/products", "/inventory", "/sell", "/contacts", "/settings", "/mobile/dashboard"];
      break;
  }

  // Filter groups
  return navGroups.map(group => {
    return {
      title: group.title,
      items: group.items.filter(item => allowedPaths.includes(item.path))
    };
  }).filter(group => group.items.length > 0);
};


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

  if (pathname.startsWith('/employees/add')) return { title: 'Add New Employee', description: 'Create a new staff profile' };
  if (pathname.startsWith('/employees/edit')) return { title: 'Edit Employee', description: 'Update employee details' };
  if (pathname.startsWith('/employees/tasks/add')) return { title: 'Create New Task', description: 'Assign a job to an employee' };
  if (pathname.startsWith('/employees/tasks/edit')) return { title: 'Edit Task', description: 'Update task details' };
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
                "flex items-center gap-3 px-3 h-10 rounded-md transition-all duration-200 justify-center cursor-pointer",
                active ? "bg-primary/10 text-primary font-medium" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              )}>
                {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
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
            "flex items-center justify-between px-3 h-10 rounded-md transition-all duration-200 cursor-pointer",
            active ? "bg-primary/10 text-primary font-medium" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
          )}>
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1 mt-1 overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          {item.children.map(child => (
            <Link key={child.path} to={child.path} onClick={onMobileClick} className={cn(
              "flex items-center gap-2 px-3 h-9 rounded-md transition-all duration-200 text-sm",
              isActive(child.path) ? "bg-primary/10 text-primary font-medium" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
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
        "flex items-center gap-3 px-3 h-10 rounded-md transition-all duration-200",
        isCollapsed && "justify-center px-2",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
      )}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
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

export const SidebarMobileContent = ({ onLinkClick, activePlan = "FULL_ERP" }: { onLinkClick?: () => void, activePlan?: ModulePlan }) => {
  const filteredNavGroups = getFilteredNavGroups(activePlan);
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-sidebar">
      <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto no-scrollbar pb-6">
        {filteredNavGroups.map((group, idx) => (
          <div key={group.title} className="mb-6">
            <h4 className="px-3 mb-2 text-xs font-bold tracking-widest text-slate-400/80 uppercase">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem key={item.path} item={item as NavItem} isCollapsed={false} onMobileClick={onLinkClick} />
              ))}
            </div>
            {idx < filteredNavGroups.length - 1 && (
              <div className="mx-2 mt-6 border-t border-slate-200/50 dark:border-slate-800/50" />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [activePlan, setActivePlan] = useState<ModulePlan>("FULL_ERP");
  const filteredNavGroups = getFilteredNavGroups(activePlan);
  const activePlanDetails = DEMO_PLANS.find(p => p.id === activePlan);
  const PlanIcon = activePlanDetails?.icon || Building2;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 z-50 transition-all duration-300 flex-col shadow-sm",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-foreground/10 flex-shrink-0",
          isCollapsed ? "justify-center" : "justify-between"
        )}>

          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors overflow-hidden mr-2 flex-grow">
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <PlanIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col flex-grow truncate text-left">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                      {activePlanDetails?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                      Active Plan
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuLabel className="text-xs text-slate-500 uppercase">Change Active Plan (Demo)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DEMO_PLANS.map(plan => (
                  <DropdownMenuItem
                    key={plan.id}
                    onClick={() => setActivePlan(plan.id)}
                    className="flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <plan.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{plan.name}</span>
                        <span className="text-xs text-slate-500">{plan.desc}</span>
                      </div>
                    </div>
                    {activePlan === plan.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800", isCollapsed && "mx-auto")}
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
          {filteredNavGroups.map((group, idx) => (
            <div key={group.title} className={cn("mb-6", isCollapsed && "mb-2")}>
              {!isCollapsed && (
                <h4 className="px-3 mb-2 text-xs font-bold tracking-widest text-slate-400/80 uppercase">
                  {group.title}
                </h4>
              )}
              {isCollapsed && idx !== 0 && <div className="mx-4 my-2 border-t border-slate-200/50 dark:border-slate-800/50" />}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed} />
                ))}
              </div>
              {!isCollapsed && idx < filteredNavGroups.length - 1 && (
                <div className="mx-2 mt-6 border-t border-slate-200/50 dark:border-slate-800/50" />
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;