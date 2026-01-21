import { useState } from "react";
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

    return (
        <PageLayout>
            <PageHeader
                title="Performance Analytics"
                description="Employee productivity and revenue metrics"
                actions={
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
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
                    </Popover>
                }
            />

            <div className="p-4 md:p-6 space-y-6">

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Collected via Tasks</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTasks}</div>
                            <p className="text-xs text-muted-foreground">+{avgCompletionRate.toFixed(1)}% completion rate</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{performance?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Employees tracked</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Per-Employee Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performance || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="full_name" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="tasks_completed" name="Tasks Done" fill="#8884d8" />
                                    <Bar yAxisId="right" dataKey="revenue_collected" name="Revenue (₹)" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Metrics</CardTitle>
                        <CardDescription>Performance data for the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
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
                                    <TableRow key={emp.employee_id}>
                                        <TableCell className="font-medium whitespace-nowrap">{emp.full_name}</TableCell>
                                        <TableCell>{emp.attendance_days}</TableCell>
                                        <TableCell>{emp.tasks_assigned}</TableCell>
                                        <TableCell>{emp.tasks_completed}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.tasks_completion_rate > 80 ? 'default' : 'secondary'}>
                                                {emp.tasks_completion_rate}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">₹{emp.revenue_collected}</TableCell>
                                    </TableRow>
                                ))}
                                {performance?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No data for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
