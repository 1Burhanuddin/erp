import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Wallet, Calendar, Download, ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, Activity, BarChart3, PieChart as PieChartIcon, Target, CreditCard, TrendingUp as TrendingUpIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
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
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

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
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <Activity className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Unable to load reports</h3>
            <p className="text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const clearDateRange = () => {
    setDateRange({});
  };

  // Calculate metrics
  const salesData = report?.monthlySales || [];
  const categoryData = report?.categoryDistribution || [];
  const topProducts = report?.topProducts || [];
  const topCustomers = report?.topCustomers || [];

  // Export functions
  const handleExportSummary = () => {
    if (!report) return;
    
    const summaryData = [
      { metric: "Total Revenue", value: report.totalRevenue, currency: "₹" },
      { metric: "Total Orders", value: report.totalOrders, currency: "" },
      { metric: "Total Expenses", value: report.totalExpenses, currency: "₹" },
      { metric: "Net Profit", value: report.netProfit, currency: "₹" }
    ];
    
    const dateRangeStr = dateRange.from && dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}`
      : "all_time";
    
    downloadCSV(summaryData, ["Metric", "Value"], (item) => [
      item.metric,
      item.currency ? `${item.currency}${item.value.toLocaleString()}` : item.value.toString()
    ], `reports_summary_${dateRangeStr}.csv`);
  };

  const HeaderActions = () => {
    const container = document.getElementById('header-actions');
    if (!mounted || !container) return null;
    
    return createPortal(
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex"
          onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                <>
                  {format(dateRange.from, "MMM dd, y")} -{" "}
                  {format(dateRange.to, "MMM dd, y")}
                </>
              ) : (
                <span>All Time</span>
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
        
        {dateRange.from && (
          <Button variant="ghost" size="sm" onClick={clearDateRange}>
            Clear
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportSummary}>
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Summary Report
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              <div className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Monthly Sales
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              <div className="flex items-center">
                <PieChartIcon className="mr-2 h-4 w-4" />
                Category Breakdown
              </div>
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
      
      {/* Modern Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Business Analytics</h1>
            <p className="text-lg text-muted-foreground">Track your performance and growth metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Detailed
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-8">
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">₹{report?.totalRevenue?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                <div className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  +{report?.trends?.revenue || 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">{report?.totalOrders?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                <div className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  +{report?.trends?.orders || 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">₹{report?.totalExpenses?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
                <div className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded-full">
                  <TrendingDown className="h-3 w-3" />
                  +{report?.trends?.expenses || 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">₹{report?.netProfit?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mb-1">Net Profit</div>
                <div className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">
                  <TrendingUpIcon className="h-3 w-3" />
                  +{report?.trends?.profit || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Revenue Trend */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Revenue Trend</h3>
                <p className="text-sm text-muted-foreground">Monthly performance overview</p>
              </div>
              <div className="h-[320px]">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="320">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area 
                        type="monotone"
                        dataKey="sales" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fill="url(#revenueGradient)" 
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-medium text-muted-foreground">No revenue data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Revenue by Category</h3>
                <p className="text-sm text-muted-foreground">Sales distribution across categories</p>
              </div>
              <div className="h-[320px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {categoryData.map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={entry.color} stopOpacity={0.3}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={6}
                        dataKey="value"
                        cornerRadius={8}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <PieChartIcon className="h-16 w-16 mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-medium text-muted-foreground">No category data available</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Category Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm bg-muted/50 px-4 py-2 rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Top Products</h3>
                <p className="text-sm text-muted-foreground">Best selling items this period</p>
              </div>
              <div className="h-[320px]">
                {topProducts && topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 8, 8]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-16 w-16 mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-medium text-muted-foreground">No product data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Top Customers</h3>
                <p className="text-sm text-muted-foreground">Highest revenue generating clients</p>
              </div>
              <div className="h-[320px]">
                {topCustomers && topCustomers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCustomers}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="value" fill="hsl(142, 76%, 36%)" radius={[8, 8, 8, 8]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-16 w-16 mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-medium text-muted-foreground">No customer data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Reports;