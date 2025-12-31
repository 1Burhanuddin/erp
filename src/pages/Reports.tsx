import { PageLayout, PageHeader } from "@/components/layout";
import { StatsCard } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useReports } from "@/api/reports";
import { Skeleton } from "@/components/ui/skeleton";

const Reports = () => {
  const { data: report, isLoading } = useReports();

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Reports" description="Analytics and business insights" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  // Calculate trends (simple comparison with previous month for now, or static as placeholders since we didn't calculate full trends in API yet)
  // For V1, we will just show the dynamic values.

  const salesData = report?.monthlySales || [];
  const categoryData = report?.categoryDistribution || [];

  return (
    <PageLayout>
      <PageHeader title="Reports" description="Analytics and business insights" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
        <StatsCard
          title="Total Revenue"
          value={`$${report?.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }} // TODO: implementations trend calculation
        />
        <StatsCard
          title="Total Orders"
          value={report?.totalOrders.toLocaleString() || "0"}
          icon={<ShoppingCart className="h-5 w-5" />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Total Expenses"
          value={`$${report?.totalExpenses.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          trend={{ value: 0, isPositive: false }}
        />
        <StatsCard
          title="Net Profit"
          value={`$${report?.netProfit.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 0, isPositive: report?.netProfit && report.netProfit >= 0 ? true : false }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 bg-card border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Monthly Sales</h3>
          <div className="h-[250px] md:h-[300px]">
            {salesData.length > 0 ? (
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
                    cursor={{ fill: 'transparent' }}
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
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-card border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Sales by Category</h3>
          <div className="h-[250px] md:h-[300px]">
            {categoryData.length > 0 ? (
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No items sold yet
              </div>
            )}
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