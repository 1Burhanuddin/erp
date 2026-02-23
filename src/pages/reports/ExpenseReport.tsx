import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar, Wallet, PieChart as PieChartIcon, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CSVLink } from "react-csv";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const ExpenseReport = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    useEffect(() => {
        fetchExpenses();
    }, [dateRange]);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from("expenses")
                .select(`
                    id, 
                    expense_date, 
                    amount, 
                    reference_no, 
                    notes,
                    expense_categories(name)
                `)
                .order('expense_date', { ascending: false });

            if (dateRange.from) query = query.gte('expense_date', format(dateRange.from, 'yyyy-MM-dd'));
            if (dateRange.to) query = query.lte('expense_date', format(dateRange.to, 'yyyy-MM-dd'));

            const { data, error } = await query;

            if (error) throw error;
            setExpenses(data || []);
        } catch (err: any) {
            console.error("Error fetching expenses:", err);
            setError(err.message || "Failed to load expense data");
        } finally {
            setIsLoading(false);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Group by category for Pie Chart
    const expensesByCategory = expenses.reduce((acc: any, e) => {
        const cat = e.expense_categories?.name || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + (e.amount || 0);
        return acc;
    }, {});

    const pieData = Object.keys(expensesByCategory).map(key => ({
        name: key,
        value: expensesByCategory[key]
    })).sort((a, b) => b.value - a.value);

    const maxCategory = pieData.length > 0 ? pieData[0] : null;

    const csvHeaders = [
        { label: "Date", key: "date" },
        { label: "Category", key: "category" },
        { label: "Amount", key: "amount" },
        { label: "Reference No", key: "reference_no" },
        { label: "Notes", key: "notes" }
    ];

    const csvData = expenses.map(e => ({
        date: format(new Date(e.expense_date), 'yyyy-MM-dd'),
        category: e.expense_categories?.name || 'Uncategorized',
        amount: e.amount,
        reference_no: e.reference_no,
        notes: e.notes
    }));

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <PageHeader
                    title="Expense Breakdown"
                    description="Analyze your operational costs and spending patterns."
                    className="mb-0"
                />

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal rounded-full", !dateRange.from && "text-muted-foreground")}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
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
                                onSelect={(range: any) => setDateRange(range)}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button asChild className="rounded-full shadow-sm">
                        <CSVLink data={csvData} headers={csvHeaders} filename={`Expense_Report_${format(new Date(), 'yyyyMMdd')}.csv`}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </CSVLink>
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-6 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium">
                    Failed to load: {error}
                </div>
            )}

            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-[300px] rounded-3xl" />
                        <Skeleton className="h-[300px] rounded-3xl" />
                    </div>
                    <Skeleton className="h-[400px] rounded-3xl" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-rose-50/50 lg:col-span-1">
                            <CardContent className="p-6 h-full flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm">
                                        <Wallet className="h-6 w-6" />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-lg">
                                        <TrendingDown className="h-3 w-3" /> Expenses
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-rose-900/60 uppercase tracking-wider mb-2">Total Mapped Expenses</p>
                                <h3 className="text-4xl font-bold text-rose-700">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>

                                {maxCategory && (
                                    <div className="mt-8 pt-6 border-t border-rose-200/50">
                                        <p className="text-sm text-rose-900/80">Highest Spend Category</p>
                                        <p className="font-bold text-rose-900">{maxCategory.name} <span className="text-rose-600 font-normal opacity-75 ml-1">({Math.round((maxCategory.value / totalExpenses) * 100)}%)</span></p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-0 shadow-sm overflow-hidden lg:col-span-2">
                            <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-stone-500" /> Spending by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 h-[300px]">
                                {pieData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">No expenses recorded for this period.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden mb-8">
                        <CardHeader className="bg-stone-50/50 border-b border-stone-100 flex flex-row justify-between items-center py-4">
                            <CardTitle className="text-lg">Detailed Expense Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Ref / Bill No</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right pr-6">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                No expenses found in this period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        expenses.map((e) => (
                                            <TableRow key={e.id} className="hover:bg-stone-50">
                                                <TableCell className="font-medium pl-6">{format(new Date(e.expense_date), 'dd MMM yyyy')}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-700">
                                                        {e.expense_categories?.name || 'Uncategorized'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-stone-500">{e.reference_no || '-'}</TableCell>
                                                <TableCell className="text-stone-600 truncate max-w-[200px]" title={e.notes}>{e.notes || '-'}</TableCell>
                                                <TableCell className="text-right font-medium text-rose-600 pr-6">₹{e.amount?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </PageLayout>
    );
};

export default ExpenseReport;
