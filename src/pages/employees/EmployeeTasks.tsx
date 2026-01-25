import { useState, useEffect } from "react";

import { PageLayout, PageHeader } from "@/components/layout";
import { useEmployeeTasks, useEmployees } from "@/api/employees"; // useEmployees for user name if needed
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CheckCircle2, Clock, MapPin } from "lucide-react";
import { DataViewToggle } from "@/components/shared";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EmployeeTasks() {
    const navigate = useNavigate();
    const { data: tasks, isLoading } = useEmployeeTasks();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const filteredTasks = tasks?.filter(task => {
        const matchesSearch =
            task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 hover:bg-green-600';
            case 'in_progress': return 'bg-blue-500 hover:bg-blue-600';
            case 'accepted': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'cancelled': return 'bg-destructive hover:bg-destructive/90';
            default: return 'bg-secondary hover:bg-secondary/80 text-secondary-foreground';
        }
    };



    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                <ExpandableSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search tasks..."
                    className="w-full"
                />
                <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 rounded-full bg-background shadow-sm border-muted">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
            <Button
                onClick={() => navigate("/employees/tasks/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Create Task</span>
            </Button>

            <div className="p-4 md:p-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No tasks found.
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <div className="bg-card rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTasks.map((task) => (
                                            <TableRow
                                                key={task.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/employees/tasks/edit/${task.id}`)}
                                            >
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(task.status)}>
                                                        {task.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{task.customer_name || '-'}</TableCell>
                                                <TableCell>
                                                    {task.payment_amount ? `₹${task.payment_amount}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {task.created_at ? format(new Date(task.created_at), "MMM d") : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTasks.map((task) => (
                                    <Card
                                        key={task.id}
                                        className="cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => navigate(`/employees/tasks/edit/${task.id}`)}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium line-clamp-1">
                                                {task.title}
                                            </CardTitle>
                                            <Badge className={getStatusColor(task.status)}>
                                                {task.status.replace('_', ' ')}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col gap-2 text-sm">
                                                {task.customer_name && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <User className="h-3 w-3" />
                                                        {task.customer_name}
                                                    </div>
                                                )}
                                                {task.customer_address && (
                                                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                                                        <MapPin className="h-3 w-3" />
                                                        {task.customer_address}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                                    <span className="font-medium">
                                                        {task.payment_amount ? `₹${task.payment_amount}` : 'No Payment'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {task.created_at ? format(new Date(task.created_at), "MMM d") : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageLayout>
    );
}

function User(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
