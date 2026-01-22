import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, CheckCircle, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentEmployee } from "@/api/employees";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function EmployeePerformance() {
    const { data: currentEmployee } = useCurrentEmployee();
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const { data: performance, isLoading } = useQuery({
        queryKey: ["employee_performance", dateRange, currentEmployee?.store_id],
        enabled: !!currentEmployee?.store_id,
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_employee_performance', {
                p_start_date: dateRange.from.toISOString(),
                p_end_date: dateRange.to.toISOString(),
                p_store_id: currentEmployee!.store_id
            });
            if (error) throw error;
            return data;
        }
    });

    // Aggregates
    const totalRevenue = performance?.reduce((acc, curr) => acc + (curr.revenue_collected || 0), 0) || 0;
    const totalTasks = performance?.reduce((acc, curr) => acc + (curr.tasks_completed || 0), 0) || 0;
    const avgCompletionRate = performance?.length
        ? performance.reduce((acc, curr) => acc + (curr.tasks_completion_rate || 0), 0) / performance.length
        : 0;

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!mounted || !container) return null;

        return createPortal(
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal rounded-full",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange as any}
                        onSelect={(range: any) => {
                            if (range?.from) {
                                setDateRange({
                                    from: range.from,
                                    to: range.to || range.from
                                });
                            }
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>,
            container
        );
    };

    return (
        <PageLayout>
            <HeaderActions />
            <PageHeader
                title="Performance Analytics"
                description="Employee productivity and revenue metrics"
            />

            <div className="p-4 md:p-6 space-y-6">

                {/* KPI Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="rounded-3xl border-0 shadow-sm p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <IndianRupee className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <h3 className="text-2xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Collected via Tasks</p>
                        </div>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-sm p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                            <h3 className="text-2xl font-bold mt-1">{totalTasks}</h3>
                            <p className="text-xs text-muted-foreground mt-1 text-green-600">+{avgCompletionRate.toFixed(1)}% completion rate</p>
                        </div>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-sm p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                            <h3 className="text-2xl font-bold mt-1">{performance?.length || 0}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Employees tracked</p>
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <Card className="rounded-3xl border-0 shadow-sm p-6">
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg">Per-Employee Breakdown</h3>
                        <p className="text-sm text-muted-foreground">Task completion vs Revenue generation</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performance || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="full_name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value}`}
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
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar
                                    yAxisId="left"
                                    dataKey="tasks_completed"
                                    name="Tasks Done"
                                    fill="hsl(var(--primary))"
                                    radius={[50, 50, 50, 50]}
                                    barSize={30}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="revenue_collected"
                                    name="Revenue (₹)"
                                    fill="hsl(142, 76%, 36%)" // Green for money
                                    radius={[50, 50, 50, 50]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Detailed Table */}
                <Card className="rounded-3xl border-0 shadow-sm p-6">
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg">Detailed Metrics</h3>
                        <p className="text-sm text-muted-foreground">Performance data for the selected period.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Attendance (Days)</TableHead>
                                    <TableHead>Tasks Assigned</TableHead>
                                    <TableHead>Tasks Completed</TableHead>
                                    <TableHead>Completion Rate</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performance?.map((emp) => (
                                    <TableRow key={emp.employee_id} className="hover:bg-muted/30 border-b border-border/50">
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {emp.full_name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                {emp.full_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{emp.attendance_days}</TableCell>
                                        <TableCell>{emp.tasks_assigned}</TableCell>
                                        <TableCell>{emp.tasks_completed}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.tasks_completion_rate > 80 ? 'default' : 'secondary'} className="rounded-full">
                                                {emp.tasks_completion_rate}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-primary">₹{emp.revenue_collected?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {performance?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No data for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
}
