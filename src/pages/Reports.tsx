import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const { data: report, isLoading, error } = useReports(
    dateRange.from && dateRange.to
      ? { startDate: dateRange.from, endDate: dateRange.to }
      : undefined
  );

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Reports" description="Analytics and business insights" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
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

  const HeaderActions = () => {
    const container = document.getElementById('header-actions');
    if (!mounted || !container) return null;

    return createPortal(
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal rounded-full",
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
          <Button variant="ghost" onClick={clearDateRange} className="rounded-full">
            Clear
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full">
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
      </div>,
      container
    );
  };

  return (
    <PageLayout>
      <HeaderActions />
      <PageHeader title="Reports" description="Analytics and business insights" />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-[2rem] border-0 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Monthly Sales</h3>
            <p className="text-sm text-muted-foreground">Revenue overview over time</p>
          </div>
          <div className="h-[300px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[50, 50, 50, 50]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Sales by Category</h3>
            <p className="text-sm text-muted-foreground">Distribution of revenue sources</p>
          </div>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70} // Thicker donut
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    cornerRadius={6}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No items sold yet
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm bg-muted/30 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Products */}
        <Card className="rounded-[2rem] border-0 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Top Selling Products</h3>
            <p className="text-sm text-muted-foreground">Best performing inventory items</p>
          </div>
          <div className="h-[300px]">
            {report?.topProducts && report.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={report.topProducts}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="value" fill="hsl(262, 83%, 58%)" radius={[50, 50, 50, 50]} barSize={20} />
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
        <Card className="rounded-[2rem] border-0 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Top Customers</h3>
            <p className="text-sm text-muted-foreground">Highest revenue generating clients</p>
          </div>
          <div className="h-[300px]">
            {report?.topCustomers && report.topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={report.topCustomers}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="value" fill="hsl(142, 76%, 36%)" radius={[50, 50, 50, 50]} barSize={20} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue - Primary Style */}
        <Card className="p-6 bg-primary text-primary-foreground rounded-[2rem] border-0 relative overflow-hidden group min-h-[160px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="text-primary-foreground/80 font-medium">Total Revenue</span>
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">₹{report?.totalRevenue.toLocaleString()}</h2>
            <div className="flex items-center gap-2 text-xs font-medium bg-primary-foreground/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
              <span className={cn(
                "flex items-center",
                (report?.trends?.revenue || 0) >= 0 ? "text-primary-foreground" : "text-primary-foreground/80"
              )}>
                {(report?.trends?.revenue || 0) >= 0 ? "+" : ""}
                {report?.trends?.revenue || 0}% from last month
              </span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-foreground/5 rounded-full blur-2xl group-hover:bg-primary-foreground/10 transition-colors" />
        </Card>

        {/* Total Orders */}
        <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all min-h-[160px]">
          <div className="flex justify-between items-start mb-6">
            <span className="text-muted-foreground font-medium">Total Orders</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">{report?.totalOrders.toLocaleString()}</h2>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={cn(
              "px-1.5 py-0.5 rounded",
              (report?.trends?.orders || 0) >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
            )}>
              {(report?.trends?.orders || 0) >= 0 ? "+" : ""}
              {report?.trends?.orders || 0}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all min-h-[160px]">
          <div className="flex justify-between items-start mb-6">
            <span className="text-muted-foreground font-medium">Total Expenses</span>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">₹{report?.totalExpenses.toLocaleString()}</h2>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={cn(
              "px-1.5 py-0.5 rounded",
              (report?.trends?.expenses || 0) <= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
            )}>
              {(report?.trends?.expenses || 0) > 0 ? "+" : ""}
              {report?.trends?.expenses || 0}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        </Card>

        {/* Net Profit */}
        <Card className="p-6 rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all min-h-[160px]">
          <div className="flex justify-between items-start mb-6">
            <span className="text-muted-foreground font-medium">Net Profit</span>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">₹{report?.netProfit.toLocaleString()}</h2>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={cn(
              "px-1.5 py-0.5 rounded",
              (report?.trends?.profit || 0) >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
            )}>
              {(report?.trends?.profit || 0) >= 0 ? "+" : ""}
              {report?.trends?.profit || 0}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reports;