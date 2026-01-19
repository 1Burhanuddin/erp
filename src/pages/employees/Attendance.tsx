import { useState } from "react";

import { useAttendance } from "@/api/employees";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
    const [date, setDate] = useState<Date>(new Date());
    const { data: attendanceLogs, isLoading } = useAttendance(date);

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Attendance</h1>

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
            </div>

            <div className="bg-card rounded-lg border border-border">
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : !attendanceLogs || attendanceLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No attendance records for this date.
                                </TableCell>
                            </TableRow>
                        ) : (
                            attendanceLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.employees?.full_name || "Unknown"}</TableCell>
                                    <TableCell>
                                        {log.check_in ? format(new Date(log.check_in), "h:mm a") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {log.check_out ? format(new Date(log.check_out), "h:mm a") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            log.status === 'present' && "bg-green-100 text-green-800",
                                            log.status === 'late' && "bg-yellow-100 text-yellow-800",
                                            (log.status === 'absent' || log.status === 'half_day') && "bg-red-100 text-red-800",
                                        )}>
                                            {log.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{log.notes || "-"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
