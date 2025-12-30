
export interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
}

export const mockContacts: Contact[] = [
  { id: 1, name: "John Doe", email: "john@example.com", company: "Tech Corp", role: "CEO" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", company: "Design Co", role: "Designer" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", company: "Dev Inc", role: "Developer" },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com", company: "Marketing Pro", role: "Manager" },
];

export interface DashboardStat {
  title: string;
  value: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  iconType: 'users' | 'dollar' | 'target' | 'award';
}

export const mockDashboardStats: DashboardStat[] = [
  {
    title: "Total Customers",
    value: "1,234",
    trend: { value: 12, isPositive: true },
    iconType: 'users'
  },
  {
    title: "Revenue",
    value: "$50,234",
    trend: { value: 8, isPositive: true },
    iconType: 'dollar'
  },
  {
    title: "Active Deals",
    value: "45",
    trend: { value: 5, isPositive: false },
    iconType: 'target'
  },
  {
    title: "Win Rate",
    value: "68%",
    trend: { value: 3, isPositive: true },
    iconType: 'award'
  }
];

export interface ChartDataPoint {
  name: string;
  value: number;
}

export const mockLineChartData: ChartDataPoint[] = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
];

export interface BarChartDataPoint {
  name: string;
  deals: number;
  revenue: number;
}

export const mockBarChartData: BarChartDataPoint[] = [
  { name: "Q1", deals: 42, revenue: 145 },
  { name: "Q2", deals: 38, revenue: 132 },
  { name: "Q3", deals: 55, revenue: 187 },
  { name: "Q4", deals: 47, revenue: 166 },
];

// Inventory mock data
export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: string;
}

export const mockInventory: InventoryItem[] = [
  { id: 1, name: "Laptop Pro 15", sku: "LP-001", quantity: 45, price: 1299.99, status: "In Stock" },
  { id: 2, name: "Wireless Mouse", sku: "WM-002", quantity: 8, price: 29.99, status: "Low Stock" },
  { id: 3, name: "USB-C Hub", sku: "UH-003", quantity: 0, price: 49.99, status: "Out of Stock" },
  { id: 4, name: "Mechanical Keyboard", sku: "MK-004", quantity: 32, price: 159.99, status: "In Stock" },
  { id: 5, name: "Monitor 27\"", sku: "MN-005", quantity: 15, price: 399.99, status: "In Stock" },
];

// Invoice mock data
export interface Invoice {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
}

export const mockInvoices: Invoice[] = [
  { id: "INV-001", customer: "Tech Corp", date: "2024-01-15", dueDate: "2024-02-15", amount: 2500.00, status: "Paid" },
  { id: "INV-002", customer: "Design Co", date: "2024-01-18", dueDate: "2024-02-18", amount: 1800.00, status: "Pending" },
  { id: "INV-003", customer: "Dev Inc", date: "2024-01-10", dueDate: "2024-02-10", amount: 3200.00, status: "Overdue" },
  { id: "INV-004", customer: "Marketing Pro", date: "2024-01-22", dueDate: "2024-02-22", amount: 950.00, status: "Draft" },
  { id: "INV-005", customer: "Sales Hub", date: "2024-01-25", dueDate: "2024-02-25", amount: 4100.00, status: "Paid" },
];

// Order mock data
export interface Order {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: string;
}

export const mockOrders: Order[] = [
  { id: "ORD-001", customer: "John Doe", date: "2024-01-20", items: 3, total: 459.97, status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", date: "2024-01-21", items: 1, total: 1299.99, status: "Shipped" },
  { id: "ORD-003", customer: "Mike Johnson", date: "2024-01-22", items: 5, total: 289.95, status: "Processing" },
  { id: "ORD-004", customer: "Sarah Williams", date: "2024-01-23", items: 2, total: 559.98, status: "Pending" },
  { id: "ORD-005", customer: "Tom Brown", date: "2024-01-24", items: 4, total: 799.96, status: "Delivered" },
];
