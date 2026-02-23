const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// 1. Add imports
content = content.replace(/import \{ supabase \} from "@\/lib\/supabase";/, `import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/hooks";
import { 
  Building2, 
  Store, 
  Receipt, 
  UsersRound, 
  BriefcaseBusiness,
  CheckCircle2
} from "lucide-react";`);

// 2. Define Plans & Module Logic
const planLogic = `
type ModulePlan = "FULL_ERP" | "BILLING_ONLY" | "HR_ONLY" | "ECOMMERCE";

// Mock plans for demonstration - in real app this comes from Supabase \`subscriptions\` table
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
`;

content = content.replace(/const navItems = navGroups.flatMap\(g => g.items\);/, `const navItems = navGroups.flatMap(g => g.items);\n${planLogic}`);

// 3. Inject State into Sidebar
content = content.replace(/const Sidebar = \(\{ isCollapsed, setIsCollapsed \}: SidebarProps\) => \{/, 
`const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [activePlan, setActivePlan] = useState<ModulePlan>("FULL_ERP");
  const filteredNavGroups = getFilteredNavGroups(activePlan);
  const activePlanDetails = DEMO_PLANS.find(p => p.id === activePlan);
  const PlanIcon = activePlanDetails?.icon || Building2;
`);

// 4. Replace navGroups with filteredNavGroups in Maps
content = content.replace(/navGroups\.map\(\(group, idx\)/g, "filteredNavGroups.map((group, idx)");
content = content.replace(/idx < navGroups\.length - 1/g, "idx < filteredNavGroups.length - 1");

// Fix mobile sidebar map too
content = content.replace(/export const SidebarMobileContent = \(\{ onLinkClick \}: \{ onLinkClick\?: \(\) => void \}\) => \{/,
`export const SidebarMobileContent = ({ onLinkClick, activePlan = "FULL_ERP" }: { onLinkClick?: () => void, activePlan?: ModulePlan }) => {
  const filteredNavGroups = getFilteredNavGroups(activePlan);`);
content = content.replace(/\{navGroups\.map\(\(group\) => \(/g, "{filteredNavGroups.map((group) => (");


// 5. Build the Dropdown Header
const newHeader = `
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
          )}`;

content = content.replace(/\{\!isCollapsed && \(\s*<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary\/60 bg-clip-text text-transparent">\s*ERP System\s*<\/h1>\s*\)\}/, newHeader);


fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
console.log('Sidebar logic inserted!');
