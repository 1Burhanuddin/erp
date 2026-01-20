import { useState, useEffect } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useAttendance, useCheckIn, useCheckOut, useEmployeeTasks } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const { data: attendanceLogs, isLoading: isLoadingAttendance } = useAttendance(new Date());
    const { data: tasks, isLoading: isLoadingTasks } = useEmployeeTasks(user?.id);

    const checkIn = useCheckIn();
    const checkOut = useCheckOut();

    // RLS ensures we only receive our own attendance records.
    // Unique constraint ensures only one record per day.
    const todaySession = attendanceLogs?.[0];
    const isCheckedIn = !!todaySession?.check_in && !todaySession?.check_out;
    const hasCompletedShift = !!todaySession?.check_in && !!todaySession?.check_out;

    const handleCheckIn = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                checkIn.mutate({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                });
            }, (error) => {
                console.error("Geolocation error:", error);
                // Fallback without location
                checkIn.mutate({});
            });
        } else {
            checkIn.mutate({});
        }
    };

    const handleCheckOut = () => {
        if (!todaySession) return;
        checkOut.mutate({ attendanceId: todaySession.id });
    };

    // Stats
    const pendingCount = tasks?.filter(t => ['pending', 'accepted', 'in_progress'].includes(t.status)).length || 0;
    const completedCount = tasks?.filter(t => t.status === 'completed').length || 0;

    return (
        <EmployeeLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Hello, {user?.email?.split('@')[0]}</h2>
                        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, d MMM")}</p>
                    </div>

                    <div className="text-right">
                        <Badge variant={isCheckedIn ? "default" : "secondary"}>
                            {isCheckedIn ? "On Duty" : "Off Duty"}
                        </Badge>
                    </div>
                </div>

                {/* Attendance Action Card */}
                <Card className="border-2 border-primary/10 shadow-lg">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Clock className="w-8 h-8 text-primary" />
                        </div>

                        <div>
                            {isCheckedIn ? (
                                <>
                                    <h3 className="text-2xl font-bold text-foreground">Checked In</h3>
                                    <p className="text-muted-foreground text-sm">Since {format(new Date(todaySession!.check_in!), "h:mm a")}</p>
                                </>
                            ) : hasCompletedShift ? (
                                <>
                                    <h3 className="text-2xl font-bold text-foreground">Shift Completed</h3>
                                    <p className="text-muted-foreground text-sm">You have checked out at {format(new Date(todaySession!.check_out!), "h:mm a")}</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-foreground">Not Checked In</h3>
                                    <p className="text-muted-foreground text-sm">Mark your attendance to start receiving tasks.</p>
                                </>
                            )}
                        </div>

                        {isCheckedIn ? (
                            <Button
                                variant="destructive"
                                size="lg"
                                className="w-full max-w-xs"
                                onClick={handleCheckOut}
                                disabled={checkOut.isPending}
                            >
                                Check Out
                            </Button>
                        ) : hasCompletedShift ? (
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full max-w-xs"
                                disabled
                            >
                                Done for Today
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="w-full max-w-xs"
                                onClick={handleCheckIn}
                                disabled={checkIn.isPending}
                            >
                                Check In Now
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 text-orange-500 mb-2" />
                            <span className="text-2xl font-bold">{pendingCount}</span>
                            <span className="text-xs text-muted-foreground">Pending Tasks</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                            <span className="text-2xl font-bold">{completedCount}</span>
                            <span className="text-xs text-muted-foreground">Completed</span>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </EmployeeLayout>
    );
}
