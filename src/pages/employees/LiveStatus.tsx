import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, AlertCircle, Phone, LayoutGrid, List } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useCurrentEmployee } from "@/api/employees";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataViewToggle } from "@/components/shared";

export default function LiveStatus() {
    const { data: currentEmployee } = useCurrentEmployee();
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const { data: employees, isLoading } = useQuery({
        queryKey: ["live_status", currentEmployee?.store_id],
        enabled: !!currentEmployee?.store_id,
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];

            // 1. Fetch active employees for this store
            const { data: emps, error: empError } = await supabase
                .from("employees")
                .select("id, full_name, phone, role")
                .eq("store_id", currentEmployee!.store_id)
                .eq("status", "active")
                .eq("role", "employee");

            if (empError) throw empError;
            if (!emps?.length) return [];

            const empIds = emps.map(e => e.id);

            // 2. Fetch today's attendance for these employees
            const { data: attendance, error: attError } = await supabase
                .from("attendance")
                .select("*")
                .eq("date", today)
                .in("employee_id", empIds);

            if (attError) throw attError;

            // 3. Fetch active tasks for these employees
            const { data: tasks, error: taskError } = await supabase
                .from("employee_tasks")
                .select("*")
                .in("status", ["in_progress", "accepted"])
                .in("employee_id", empIds);

            if (taskError) throw taskError;

            // Merge Data
            return emps.map(emp => {
                const att = attendance?.find(a => a.employee_id === emp.id);
                const activeTask = tasks?.find(t => t.employee_id === emp.id);

                let status = "offline";
                if (att) {
                    if (att.check_out) status = "checked_out";
                    else if (activeTask) status = "working";
                    else status = "idle";
                }

                return {
                    ...emp,
                    attendance: att,
                    activeTask,
                    status
                };
            });
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "working": return <Badge className="bg-green-500 hover:bg-green-600">Working</Badge>;
            case "idle": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Idle</Badge>;
            case "checked_out": return <Badge variant="outline">Checked Out</Badge>;
            default: return <Badge variant="secondary">Offline</Badge>;
        }
    };

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!mounted || !container) return null;

        return createPortal(
            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />,
            container
        );
    };

    return (
        <PageLayout>
            <HeaderActions />
            <PageHeader
                title="Live Employee Status"
                description="Real-time field force tracking"
            />


            <div className="p-6">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {employees?.map(emp => (
                            <Card key={emp.id} className="rounded-3xl border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className={`h-1 w-full ${emp.status === 'working' ? 'bg-green-500' : emp.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                                <CardHeader className="pb-2 pt-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="shrink-0 h-10 w-10">
                                                <AvatarFallback>{emp.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <CardTitle className="text-base truncate">{emp.full_name}</CardTitle>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3 shrink-0" /> <span className="truncate">{emp.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(emp.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-3 pt-2">
                                    {emp.attendance ? (
                                        <div className="flex justify-between items-center text-muted-foreground p-2 bg-secondary/30 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">{format(new Date(emp.attendance.check_in), "h:mm a")}</span>
                                            </div>
                                            {emp.attendance.check_out ? (
                                                <span>Out: {format(new Date(emp.attendance.check_out), "h:mm a")}</span>
                                            ) : <span className="text-green-600 text-xs font-medium">Active</span>}
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground italic flex items-center gap-2 p-2 bg-secondary/30 rounded-xl">
                                            <AlertCircle className="w-4 h-4" /> Not checked in yet
                                        </div>
                                    )}

                                    {emp.activeTask && (
                                        <div className="bg-primary/5 p-3 rounded-2xl space-y-1">
                                            <div className="font-medium text-primary flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {emp.activeTask.customer_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                <p className="line-clamp-1 font-medium">{emp.activeTask.title}</p>
                                                <p className="line-clamp-1">{emp.activeTask.customer_address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {emp.status === 'idle' && emp.attendance && (
                                        <div className="text-yellow-700 text-xs flex items-center gap-2 bg-yellow-50 p-2 rounded-xl">
                                            <AlertCircle className="w-3 h-3" /> Waiting for next assignment
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {employees?.length === 0 && (
                            <div className="col-span-full text-center text-muted-foreground py-12">
                                No active employees found.
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Current Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees?.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{emp.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                {emp.full_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{emp.phone}</TableCell>
                                        <TableCell>{getStatusBadge(emp.status)}</TableCell>
                                        <TableCell>
                                            {emp.attendance ? format(new Date(emp.attendance.check_in), "h:mm a") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {emp.activeTask ? (
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium">{emp.activeTask.customer_name}</span>
                                                    <span className="text-xs text-muted-foreground max-w-[200px] truncate">{emp.activeTask.title}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">
                                                    {emp.status === 'idle' ? 'Waiting for task' : '-'}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {employees?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No employees found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>
        </PageLayout>
    );
}
