
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
