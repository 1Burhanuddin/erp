import { useState } from "react";
import { useAttendance } from "@/api/employees";
import { PageLayout, PageHeader } from "@/components/layout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, LayoutGrid, List, Clock, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AttendancePage() {
    const [date, setDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const { data: attendanceLogs, isLoading } = useAttendance(date);

    return (
        <PageLayout>
            <PageHeader
                title="Attendance Log"
                description="Daily daily check-in/out records"
                actions={
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="flex bg-muted rounded-lg p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                }
            />

            <div className="p-4 md:p-6">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !attendanceLogs || attendanceLogs.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                        <User className="h-12 w-12 mb-4 opacity-20" />
                        <p>No attendance records found for this date.</p>
                    </Card>
                ) : viewMode === 'list' ? (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{log.employees?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                {log.employees?.full_name || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {log.check_in ? format(new Date(log.check_in), "h:mm a") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {log.check_out ? format(new Date(log.check_out), "h:mm a") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                log.status === 'present' ? 'default' :
                                                    log.status === 'late' ? 'secondary' : 'destructive'
                                            } className={cn(
                                                log.status === 'present' && "bg-green-100 text-green-800 hover:bg-green-100",
                                                log.status === 'late' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                                                (log.status === 'absent' || log.status === 'half_day') && "bg-red-100 text-red-800 hover:bg-red-100",
                                            )}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{log.notes || "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attendanceLogs.map((log) => (
                            <Card key={log.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{log.employees?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-semibold">{log.employees?.full_name}</div>
                                    </div>
                                    <Badge variant={
                                        log.status === 'present' ? 'default' :
                                            log.status === 'late' ? 'secondary' : 'destructive'
                                    } className={cn(
                                        log.status === 'present' && "bg-green-100 text-green-800 hover:bg-green-100",
                                        log.status === 'late' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                                        (log.status === 'absent' || log.status === 'half_day') && "bg-red-100 text-red-800 hover:bg-red-100",
                                    )}>
                                        {log.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Check In</span>
                                        <span className="font-medium text-foreground">{log.check_in ? format(new Date(log.check_in), "h:mm a") : "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Check Out</span>
                                        <span className="font-medium text-foreground">{log.check_out ? format(new Date(log.check_out), "h:mm a") : "-"}</span>
                                    </div>
                                    {log.notes && (
                                        <div className="pt-2 border-t mt-2 flex items-start gap-2 text-muted-foreground text-xs bg-muted/30 p-2 rounded">
                                            <AlertCircle className="w-3 h-3 mt-0.5" />
                                            {log.notes}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
