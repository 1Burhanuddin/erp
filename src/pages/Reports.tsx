import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatsCard } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Wallet, Calendar, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useReports } from "@/api/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { downloadCSV } from "@/lib/csvParser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Reports = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { data: report, isLoading, error } = useReports(
    dateRange.from && dateRange.to
      ? { startDate: dateRange.from, endDate: dateRange.to }
      : undefined
  );

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

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Reports" description="Analytics and business insights" />
        <div className="p-6 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <h3 className="font-semibold mb-2">Error loading reports</h3>
          <p>{(error as Error).message}</p>
        </div>
      </PageLayout>
    );
  }

  // Calculate trends (simple comparison with previous month for now, or static as placeholders since we didn't calculate full trends in API yet)
  // For V1, we will just show the dynamic values.

  const salesData = report?.monthlySales || [];
  const categoryData = report?.categoryDistribution || [];

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const clearDateRange = () => {
    setDateRange({});
  };

  const handleExportCSV = () => {
    if (!report) return;

    const dateRangeStr = dateRange.from && dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`
      : "all_time";

    // Export Summary Statistics
    const summaryData = [
      {
        metric: "Total Revenue",
        value: report.totalRevenue,
        currency: "$"
      },
      {
        metric: "Total Orders",
        value: report.totalOrders,
        currency: ""
      },
      {
        metric: "Total Expenses",
        value: report.totalExpenses,
        currency: "$"
      },
      {
        metric: "Net Profit",
        value: report.netProfit,
        currency: "$"
      }
    ];

    downloadCSV(
      summaryData,
      ["Metric", "Value"],
      (item) => [
        item.metric,
        item.currency ? `${item.currency}${item.value.toLocaleString()}` : item.value.toString()
      ],
      `reports_summary_${dateRangeStr}.csv`
    );
  };

  const handleExportMonthlySales = () => {
    if (!report || salesData.length === 0) return;

    const dateRangeStr = dateRange.from && dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`
      : "all_time";

    downloadCSV(
      salesData,
      ["Month", "Sales ($)", "Orders"],
      (item) => [
        item.month,
        item.sales.toLocaleString(),
        item.orders.toString()
      ],
      `reports_monthly_sales_${dateRangeStr}.csv`
    );
  };

  const handleExportCategoryDistribution = () => {
    if (!report || categoryData.length === 0) return;

    const dateRangeStr = dateRange.from && dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`
      : "all_time";

    downloadCSV(
      categoryData,
      ["Category", "Revenue ($)"],
      (item) => [
        item.name,
        item.value.toLocaleString()
      ],
      `reports_category_distribution_${dateRangeStr}.csv`
    );
  };

  const handleExportAll = () => {
    if (!report) return;

    const dateRangeStr = dateRange.from && dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`
      : "all_time";

    // Combine all data into a comprehensive report
    const allData: any[] = [];

    // Add summary section
    allData.push({ section: "Summary", metric: "Total Revenue", value: `$${report.totalRevenue.toLocaleString()}`, details: "" });
    allData.push({ section: "Summary", metric: "Total Orders", value: report.totalOrders.toString(), details: "" });
    allData.push({ section: "Summary", metric: "Total Expenses", value: `$${report.totalExpenses.toLocaleString()}`, details: "" });
    allData.push({ section: "Summary", metric: "Net Profit", value: `$${report.netProfit.toLocaleString()}`, details: "" });
    allData.push({ section: "", metric: "", value: "", details: "" }); // Empty row

    // Add monthly sales
    allData.push({ section: "Monthly Sales", metric: "Month", value: "Sales ($)", details: "Orders" });
    salesData.forEach(item => {
      allData.push({
        section: "Monthly Sales",
        metric: item.month,
        value: item.sales.toLocaleString(),
        details: item.orders.toString()
      });
    });
    allData.push({ section: "", metric: "", value: "", details: "" }); // Empty row

    // Add category distribution
    allData.push({ section: "Category Distribution", metric: "Category", value: "Revenue ($)", details: "" });
    categoryData.forEach(item => {
      allData.push({
        section: "Category Distribution",
        metric: item.name,
        value: item.value.toLocaleString(),
        details: ""
      });
    });

    downloadCSV(
      allData,
      ["Section", "Metric", "Value", "Details"],
      (item) => [item.section, item.metric, item.value, item.details],
      `reports_complete_${dateRangeStr}.csv`
    );
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <PageHeader title="Reports" description="Analytics and business insights" />
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {(dateRange.from || dateRange.to) && (
            <Button variant="ghost" onClick={clearDateRange}>
              Clear
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportAll}>
                Export All Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                Export Summary
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMonthlySales}>
                Export Monthly Sales
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCategoryDistribution}>
                Export Category Distribution
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
        <StatsCard
          title="Total Revenue"
          value={`$${report?.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{
            value: Math.abs(report?.trends?.revenue || 0),
            isPositive: (report?.trends?.revenue || 0) >= 0
          }}
        />
        <StatsCard
          title="Total Orders"
          value={report?.totalOrders.toLocaleString() || "0"}
          icon={<ShoppingCart className="h-5 w-5" />}
          trend={{
            value: Math.abs(report?.trends?.orders || 0),
            isPositive: (report?.trends?.orders || 0) >= 0
          }}
        />
        <StatsCard
          title="Total Expenses"
          value={`$${report?.totalExpenses.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          trend={{
            value: Math.abs(report?.trends?.expenses || 0),
            isPositive: (report?.trends?.expenses || 0) <= 0 // Lower expenses is positive
          }}
        />
        <StatsCard
          title="Net Profit"
          value={`$${report?.netProfit.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: Math.abs(report?.trends?.profit || 0),
            isPositive: (report?.trends?.profit || 0) >= 0
          }}
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* Top Products */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Top Selling Products</h3>
          <div className="h-[250px] md:h-[300px]">
            {report?.topProducts && report.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={report.topProducts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214, 32%, 91%)" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      background: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 32%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="value" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No product data available
              </div>
            )}
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Top Customers</h3>
          <div className="h-[250px] md:h-[300px]">
            {report?.topCustomers && report.topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={report.topCustomers}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214, 32%, 91%)" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      background: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 32%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="value" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No customer data available
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;