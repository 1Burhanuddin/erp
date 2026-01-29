import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Briefcase, Calendar, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useReports } from "@/api/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ProfitLoss = () => {
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
                <PageHeader title="Profit & Loss" description="Summary of revenue, costs, and expenses" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl" />
                    ))}
                </div>
                <Card className="h-[400px] rounded-3xl p-6 mb-8">
                    <Skeleton className="w-full h-full rounded-2xl" />
                </Card>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <PageHeader title="Profit & Loss" description="Summary of revenue, costs, and expenses" />
                <div className="p-6 rounded-3xl bg-destructive/10 text-destructive border border-destructive/20 text-center">
                    <h3 className="font-semibold mb-2">Error loading report</h3>
                    <p>{(error as Error).message}</p>
                </div>
            </PageLayout>
        );
    }

    const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range) setDateRange(range);
    };

    const dashboardCards = [
        {
            label: "Total Revenue",
            value: report?.totalRevenue || 0,
            trend: report?.trends?.revenue || 0,
            icon: DollarSign,
            color: "bg-blue-500",
        },
        {
            label: "Cost of Goods (COGS)",
            value: report?.cogs || 0,
            trend: 0,
            icon: Package,
            color: "bg-orange-500",
        },
        {
            label: "Gross Profit",
            value: report?.grossProfit || 0,
            trend: 0,
            icon: TrendingUp,
            color: "bg-emerald-500",
        },
        {
            label: "Operating Expenses",
            value: report?.totalExpenses || 0,
            trend: report?.trends?.expenses || 0,
            icon: Wallet,
            color: "bg-rose-500",
        },
        {
            label: "Net Profit",
            value: report?.netProfit || 0,
            trend: report?.trends?.profit || 0,
            icon: Briefcase,
            color: "bg-indigo-500",
        },
    ];

    return (
        <PageLayout>
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="Profit & Loss"
                    description="A summary of your business's financial performance"
                    className="mb-0"
                />

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal rounded-full",
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
                                    <span>Select Date Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                initialFocus
                                mode="range"
                                selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={handleDateRangeSelect}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    {dateRange.from && (
                        <Button variant="ghost" className="rounded-full" onClick={() => setDateRange({})}>
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {dashboardCards.map((card, idx) => (
                    <Card key={idx} className="p-5 rounded-3xl border-0 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={cn("p-2.5 rounded-2xl text-white shadow-lg shadow-black/5", card.color)}>
                                <card.icon className="h-5 w-5" />
                            </div>
                            {card.trend !== 0 && (
                                <div className={cn(
                                    "flex items-center text-[11px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-md border border-black/5",
                                    card.trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {card.trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {Math.abs(card.trend).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold">₹{card.value.toLocaleString()}</h3>
                        </div>
                        <div className={cn("absolute -bottom-6 -right-6 w-20 h-20 opacity-10 rounded-full blur-xl", card.color)} />
                    </Card>
                ))}
            </div>

            {/* Main Profit Graph */}
            <Card className="rounded-3xl border-0 shadow-sm p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-bold">Profit Trend</h3>
                        <p className="text-sm text-muted-foreground text-pretty max-w-md">Visualizing your monthly net profit growth</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profit</span>
                        </div>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={report?.monthlySales}>
                            <defs>
                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1.25rem',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="hsl(var(--primary))"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#profitGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Breakdown */}
                <Card className="rounded-3xl border-0 shadow-sm p-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Product Sales Performance</h3>
                        <p className="text-sm text-muted-foreground">Top revenue generating items in selected period</p>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={report?.topProducts} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Action Items/Insight Card */}
                <Card className="rounded-3xl border-0 shadow-sm p-8 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Financial Insight</h3>
                        <p className="text-indigo-50/90 text-lg leading-relaxed">
                            Your current **Net Profit Margin** is calculated from your total revenue after deducting all costs and expenses.
                            {report?.netProfit && report.netProfit > 0 ? " You're on a healthy trajectory!" : " Consider reviewing your operating costs to improve margins."}
                        </p>
                    </div>
                    <div className="mt-8 flex gap-3">
                        <Button className="bg-white text-indigo-600 hover:bg-white/90 rounded-full font-bold px-8">
                            Export Full Audit
                        </Button>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default ProfitLoss;
