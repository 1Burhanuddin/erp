import { PageLayout, PageHeader } from "@/components/layout";
import { StatsCard } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ReportsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const salesData = [
  { month: "Jan", sales: 4000, orders: 240 },
  { month: "Feb", sales: 3000, orders: 180 },
  { month: "Mar", sales: 5000, orders: 300 },
  { month: "Apr", sales: 4500, orders: 270 },
  { month: "May", sales: 6000, orders: 360 },
  { month: "Jun", sales: 5500, orders: 330 },
];

const categoryData = [
  { name: "Electronics", value: 35, color: "hsl(217, 91%, 60%)" },
  { name: "Clothing", value: 25, color: "hsl(142, 76%, 36%)" },
  { name: "Home", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Sports", value: 12, color: "hsl(199, 89%, 48%)" },
  { name: "Other", value: 8, color: "hsl(215, 20%, 65%)" },
];

const Reports = ({ isCollapsed, setIsCollapsed }: ReportsProps) => {
  return (
    <PageLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <PageHeader title="Reports" description="Analytics and business insights" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
        <StatsCard
          title="Total Revenue"
          value="$128,430"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value="1,680"
          icon={<ShoppingCart className="h-5 w-5" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="New Customers"
          value="342"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 3.1, isPositive: false }}
        />
        <StatsCard
          title="Products Sold"
          value="4,521"
          icon={<Package className="h-5 w-5" />}
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 bg-card border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Monthly Sales</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="sales" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-card border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Sales by Category</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;