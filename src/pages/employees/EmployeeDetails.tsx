import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useEmployee, useEmployeeTasks } from "@/api/employees";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Phone,
    MapPin,
    Clock,
    Calendar as CalendarIcon,
    Briefcase,
    CheckCircle,
    FileText,
    IndianRupee,
    Edit
} from "lucide-react";
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
} from 'recharts';

export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id);
    const { data: tasks, isLoading: isLoadingTasks } = useEmployeeTasks(id);

    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    // Fetch Performance Data for this specific employee
    const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
        queryKey: ["employee_performance_detail", id, dateRange],
        enabled: !!id && !!employee?.store_id,
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_employee_performance', {
                p_start_date: dateRange.from.toISOString(),
                p_end_date: dateRange.to.toISOString(),
                p_store_id: employee!.store_id
            });
            if (error) throw error;
            // Filter for this specific employee
            return data?.find((p: any) => p.employee_id === id) || null;
        }
    });

    if (isLoadingEmployee) {
        return (
            <PageLayout>
                <div className="space-y-6 p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </PageLayout>
        );
    }

    if (!employee) {
        return (
            <PageLayout>
                <div className="p-6 text-center">
                    <h2 className="text-xl font-semibold">Employee not found</h2>
                    <Button variant="link" onClick={() => navigate("/employees/list")}>Back to List</Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="p-4 md:p-6 space-y-6">
                {/* Header Profile Card */}
                <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-card">
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 relative">
                        <div className="absolute top-4 right-4">
                            <Button
                                onClick={() => navigate(`/employees/edit/${id}`)}
                                variant="secondary"
                                size="sm"
                                className="bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-sm gap-2"
                            >
                                <Edit className="h-4 w-4" /> <span className="hidden sm:inline">Edit Profile</span>
                            </Button>
                        </div>
                    </div>
                    <CardContent className="relative pt-0 pb-8 px-6 md:px-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
                            <Avatar className="h-24 w-24 border-4 border-card shadow-lg shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                    {employee.full_name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1 mb-2 w-full">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                    <h1 className="text-2xl font-bold truncate max-w-[200px] md:max-w-none">{employee.full_name}</h1>
                                    <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                                        {employee.role}
                                    </Badge>
                                    <Badge variant={employee.status === 'active' ? 'outline' : 'destructive'}
                                        className={employee.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                        {employee.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground text-sm">
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        {employee.store?.name || "Unknown Store"}
                                    </div>
                                    <div className="hidden sm:block h-3 w-px bg-border"></div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        Joined {format(new Date(employee.created_at), "MMM yyyy")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                            <div className="overflow-x-auto pb-2 -mx-2 px-2 md:pb-0 md:px-0">
                                <TabsList className="w-full justify-start md:w-auto md:inline-flex h-11 bg-muted/50 p-1">
                                    <TabsTrigger value="overview" className="flex-1 md:flex-none">Overview</TabsTrigger>
                                    <TabsTrigger value="performance" className="flex-1 md:flex-none">Performance</TabsTrigger>
                                    <TabsTrigger value="tasks" className="flex-1 md:flex-none">Tasks & Activity</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-0 shadow-sm bg-muted/20">
                                        <CardHeader>
                                            <CardTitle className="text-base">Contact Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-muted-foreground shrink-0">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium">Phone Number</p>
                                                    <p className="text-sm text-muted-foreground truncate">{employee.phone || "Not provided"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-muted-foreground shrink-0">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium">Address</p>
                                                    <p className="text-sm text-muted-foreground truncate">{employee.address || "Not provided"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-muted-foreground shrink-0">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Shift Start</p>
                                                    <p className="text-sm text-muted-foreground">{employee.shift_start || "09:00"}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Stats Summary */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="border-0 shadow-sm flex flex-col justify-center items-center p-6 text-center">
                                            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold">{tasks?.filter(t => t.status === 'completed').length || 0}</h3>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tasks Completed</p>
                                        </Card>
                                        <Card className="border-0 shadow-sm flex flex-col justify-center items-center p-6 text-center">
                                            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold">{tasks?.length || 0}</h3>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Assigned</p>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PERFORMANCE TAB */}
                            <TabsContent value="performance" className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="col-span-1 md:col-span-3 border-0 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Period</p>
                                                <h3 className="text-lg font-semibold">
                                                    {format(dateRange.from, "MMM yyyy")}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
                                                <h3 className="text-3xl font-bold text-primary">₹{performanceData?.revenue_collected?.toLocaleString() || 0}</h3>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-sm p-6 col-span-1 md:col-span-1">
                                        <h3 className="font-semibold text-lg mb-4">Task Completion</h3>
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-muted">
                                                <div className="absolute inset-0 rounded-full border-8 border-primary"
                                                    style={{ clipPath: `polygon(0 0, 100% 0, 100% ${performanceData?.tasks_completion_rate || 0}%, 0 ${performanceData?.tasks_completion_rate || 0}%)` }}></div>
                                                <span className="text-3xl font-bold">{performanceData?.tasks_completion_rate || 0}%</span>
                                            </div>
                                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                                {performanceData?.tasks_completed || 0} of {performanceData?.tasks_assigned || 0} tasks completed
                                            </p>
                                        </div>
                                    </Card>

                                    <Card className="border-0 shadow-sm p-6 col-span-1 md:col-span-2">
                                        <h3 className="font-semibold text-lg mb-4">Attendance & Activity</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                                                <div>
                                                    <p className="font-medium">Days Present</p>
                                                    <p className="text-xs text-muted-foreground">In selected month</p>
                                                </div>
                                                <div className="text-2xl font-bold">{performanceData?.attendance_days || 0}</div>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                                                <div>
                                                    <p className="font-medium">Average Completion Time</p>
                                                    <p className="text-xs text-muted-foreground">Per task estimate</p>
                                                </div>
                                                <div className="text-2xl font-bold">--</div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* TASKS TAB */}
                            <TabsContent value="tasks" className="mt-6">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Recent Tasks</CardTitle>
                                        <CardDescription>History of assigned tasks and their status.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Task Title</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Created</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tasks?.map((task) => (
                                                    <TableRow key={task.id}>
                                                        <TableCell className="font-medium">{task.title}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                task.status === 'completed' ? 'default' :
                                                                    task.status === 'in_progress' ? 'secondary' : 'outline'
                                                            }>
                                                                {task.status.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-xs">
                                                            {format(new Date(task.created_at), "MMM dd, HH:mm")}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {!tasks?.length && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                            No tasks found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
