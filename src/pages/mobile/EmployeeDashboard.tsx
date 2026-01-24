import { useState, useEffect } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useAttendance, useCheckIn, useCheckOut, useEmployeeTasks } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
            <div className="space-y-6 pb-20 px-4 pt-2">

                {/* Hero Attendance Card (Theme Color) */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20 p-8">
                    {/* Background Patterns */}
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                        <div className="w-48 h-48 rounded-full border-[24px] border-white/30" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isCheckedIn ? 'bg-white/20 backdrop-blur-md animate-pulse' : 'bg-white/10'}`}>
                                <MapPin className="w-8 h-8 text-primary-foreground" />
                            </div>
                            {isCheckedIn && (
                                <span className="absolute -top-1 -right-1 flex h-6 w-6">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-6 w-6 bg-green-400 border-2 border-primary"></span>
                                </span>
                            )}
                        </div>

                        <div>
                            {isCheckedIn ? (
                                <>
                                    <h3 className="text-3xl font-bold tracking-tight">On Duty</h3>
                                    <p className="text-primary-foreground/80 mt-1 font-medium">Checked in at {format(new Date(todaySession!.check_in!), "h:mm a")}</p>
                                </>
                            ) : hasCompletedShift ? (
                                <>
                                    <h3 className="text-3xl font-bold tracking-tight">Shift Found</h3>
                                    <p className="text-primary-foreground/80 mt-1 font-medium">Have a great evening!</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-3xl font-bold tracking-tight">Not Checked In</h3>
                                    <p className="text-primary-foreground/80 mt-1 font-medium">Ready to start your day?</p>
                                </>
                            )}
                        </div>

                        {isCheckedIn ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg bg-white/90 text-destructive hover:bg-white"
                                        disabled={checkOut.isPending}
                                    >
                                        Check Out
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[90%] rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>End Shift?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to check out now? This will mark the end of your shift for today.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCheckOut} className="bg-destructive text-destructive-foreground">Confirm Check Out</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : hasCompletedShift ? (
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full h-14 rounded-2xl text-lg font-bold bg-white/20 backdrop-blur text-primary-foreground/50 hover:bg-white/30 border-0"
                                disabled
                            >
                                Shift Completed
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-2xl text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-lg"
                                onClick={handleCheckIn}
                                disabled={checkIn.isPending}
                            >
                                Swipe to Check In
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Grid - Pastel Glass Widgets */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 flex flex-col items-center justify-center text-center space-y-2 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-black text-orange-900 dark:text-orange-100">{pendingCount}</span>
                        <span className="text-xs font-bold text-orange-600/70 dark:text-orange-400 uppercase tracking-widest">Pending</span>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center justify-center text-center space-y-2 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{completedCount}</span>
                        <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400 uppercase tracking-widest">Done</span>
                    </div>
                </div>

            </div>
        </EmployeeLayout>
    );
}
