const fs = require('fs');

const content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const newGroups = `
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
`;

let newContent = content.replace(/const navItems = \[\s*[\s\S]*?\n\];/m, newGroups);

// Update active states and remove rounding
newContent = newContent.replace(/rounded-xl transition-all duration-200 justify-center cursor-pointer/g, "rounded-md transition-all duration-200 justify-center cursor-pointer");
newContent = newContent.replace(/h-14/g, "h-10");
newContent = newContent.replace(/rounded-xl transition-all duration-200 cursor-pointer/g, "rounded-md transition-all duration-200 cursor-pointer");
newContent = newContent.replace(/rounded-lg transition-all duration-200 text-sm/g, "rounded-md transition-all duration-200 text-sm");
newContent = newContent.replace(/rounded-xl transition-all duration-200/g, "rounded-md transition-all duration-200");

// Update link layout to have sleek border
newContent = newContent.replace(/active \? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground\/10"/g,
  `active ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"`);

newContent = newContent.replace(/active\n\s*\? "bg-sidebar-accent text-sidebar-primary-foreground"\n\s*: "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground\\/10"/g,
  `active ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"`);

newContent = newContent.replace(/isActive\(child\.path\) \? "bg-sidebar-accent\/10 text-sidebar-accent" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-foreground\/5"/g,
  `isActive(child.path) ? "bg-primary/10 text-primary font-medium" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"`);

// Find the map section to inject groups
const sidebarMapRegex = /\{navItems\.map\(\(item\) => \(\s*<SidebarItem key=\{item\.path\} item=\{item\} isCollapsed=\{isCollapsed\} \/>\s*\)\)}/g;

const groupMap = `
          {navGroups.map((group, idx) => (
            <div key={group.title} className="mb-6">
              {!isCollapsed && (
                <h4 className="px-4 mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                  {group.title}
                </h4>
              )}
              {isCollapsed && idx !== 0 && <div className="mx-4 my-4 border-t border-slate-200/50 dark:border-slate-800/50" />}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem key={item.path} item={item} isCollapsed={isCollapsed} />
                ))}
              </div>
            </div>
          ))}
`;

newContent = newContent.replace(sidebarMapRegex, groupMap);

const mobileSidebarMapRegex = /\{navItems\.map\(\(item\) => \(\s*<SidebarItem key=\{item\.path\} item=\{item as NavItem\} isCollapsed=\{false\} onMobileClick=\{onLinkClick\} \/>\s*\)\)}/g;

const mobileGroupMap = `
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <h4 className="px-4 mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem key={item.path} item={item as NavItem} isCollapsed={false} onMobileClick={onLinkClick} />
                ))}
              </div>
            </div>
          ))}
`;

newContent = newContent.replace(mobileSidebarMapRegex, mobileGroupMap);

fs.writeFileSync('src/components/layout/Sidebar.tsx', newContent);
console.log('Sidebar updated');
