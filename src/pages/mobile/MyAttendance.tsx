import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useAttendance } from "@/api/employees";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyAttendance() {
    // Fetch all attendance (pass null to get full history)
    const { data: attendanceLogs, isLoading } = useAttendance(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-500 hover:bg-green-600';
            case 'late': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'half_day': return 'bg-orange-500 hover:bg-orange-600';
            case 'absent': return 'bg-destructive hover:bg-destructive';
            default: return 'bg-secondary';
        }
    };

    return (
        <EmployeeLayout>
            <div className="space-y-6 max-w-md mx-auto">

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                ) : attendanceLogs?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        No attendance records found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attendanceLogs?.map((log) => (
                            <Card key={log.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-semibold">
                                                {log.date ? format(new Date(log.date), "EEE, d MMM yyyy") : '-'}
                                            </span>
                                        </div>
                                        <Badge className={getStatusColor(log.status)}>
                                            {log.status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                        <div className="bg-muted/50 p-2 rounded">
                                            <div className="text-muted-foreground text-xs flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" /> Check In
                                            </div>
                                            <div className="font-medium text-green-700 dark:text-green-400">
                                                {log.check_in ? format(new Date(log.check_in), "h:mm a") : '--:--'}
                                            </div>
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded">
                                            <div className="text-muted-foreground text-xs flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" /> Check Out
                                            </div>
                                            <div className="font-medium text-red-700 dark:text-red-400">
                                                {log.check_out ? format(new Date(log.check_out), "h:mm a") : 'Working'}
                                            </div>
                                        </div>
                                    </div>

                                    {log.location_check_in && (
                                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1 border-t pt-2">
                                            <MapPin className="w-3 h-3" />
                                            Location logged
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
}
