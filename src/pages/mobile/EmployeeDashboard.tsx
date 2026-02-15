import { useState, useEffect } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useAttendance, useCheckIn, useCheckOut, useEmployeeTasks, useMyStoreConfig } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, CalendarDays, ChevronRight, Bell, Search, LayoutGrid, CheckCircle2, AlertCircle, Loader2, LogOut, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

// Haversine Formula (unchanged)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: attendanceLogs } = useAttendance(new Date());
    const { data: tasks } = useEmployeeTasks(user?.id);
    const { data: storeConfig } = useMyStoreConfig();

    const checkIn = useCheckIn();
    const checkOut = useCheckOut();

    // Location State
    const [locationStatus, setLocationStatus] = useState<'verifying' | 'valid' | 'invalid' | 'error'>('verifying');
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState("Locating...");
    const [currentTime, setCurrentTime] = useState(new Date());

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Watch Position
    useEffect(() => {
        if (!storeConfig?.latitude || !storeConfig?.longitude) return;

        if (!("geolocation" in navigator)) {
            setLocationStatus('error');
            setStatusMessage("No GPS");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });

                const dist = calculateDistance(lat, lng, storeConfig.latitude, storeConfig.longitude);
                const maxRadius = storeConfig.geofence_radius || 50;

                if (dist <= maxRadius) {
                    setLocationStatus('valid');
                    setStatusMessage(`In Range (${Math.round(dist)}m)`);
                } else {
                    setLocationStatus('invalid');
                    setStatusMessage(`Too Far (${Math.round(dist)}m)`);
                }
            },
            (error) => {
                setLocationStatus('error');
                setStatusMessage("GPS Error");
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [storeConfig]);

    const refreshLocation = () => {
        if (!storeConfig?.latitude || !storeConfig?.longitude) return;

        setLocationStatus('verifying');
        setStatusMessage("Refreshing...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });

                const dist = calculateDistance(lat, lng, storeConfig.latitude, storeConfig.longitude);
                const maxRadius = storeConfig.geofence_radius || 50;

                if (dist <= maxRadius) {
                    setLocationStatus('valid');
                    setStatusMessage(`In Range (${Math.round(dist)}m)`);
                } else {
                    setLocationStatus('invalid');
                    setStatusMessage(`Too Far (${Math.round(dist)}m)`);
                }
            },
            (error) => {
                setLocationStatus('error');
                setStatusMessage("GPS Error");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const todaySession = attendanceLogs?.[0];
    const isCheckedIn = !!todaySession?.check_in && !todaySession?.check_out;
    const hasCompletedShift = !!todaySession?.check_in && !!todaySession?.check_out;

    const handleCheckIn = () => {
        if (!userLocation) {
            toast.error("Waiting for location...");
            return;
        }
        checkIn.mutate({ location: userLocation });
    };

    const handleCheckOut = () => {
        if (!todaySession) return;
        checkOut.mutate({ attendanceId: todaySession.id });
    };

    const pendingCount = tasks?.filter(t => ['pending', 'accepted', 'in_progress'].includes(t.status)).length || 0;
    const completedCount = tasks?.filter(t => t.status === 'completed').length || 0;

    return (
        <EmployeeLayout>
            <div className="min-h-screen bg-[#F2F4F7] dark:bg-slate-950 pb-24 font-sans text-slate-800 dark:text-slate-100">

                <main className="px-6 pt-6 pb-6 space-y-8">

                    {/* Hero Title */}
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Your Workflow
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {format(currentTime, "EEEE, d MMM yyyy")}
                        </p>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div whileTap={{ scale: 0.98 }}>
                            <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 h-32 rounded-[2rem] relative overflow-hidden group cursor-pointer" onClick={() => navigate('/mobile/tasks')}>
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileTap={{ scale: 0.98 }}>
                            <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 h-32 rounded-[2rem] relative overflow-hidden group cursor-pointer" onClick={() => navigate('/mobile/attendance')}>
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</p>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Check In / Status Section */}
                    <div className="relative">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Time Tracking</h3>

                        <Card className="border-0 shadow-lg bg-blue-600 text-white rounded-[2.5rem] overflow-hidden relative min-h-[220px]">
                            {/* Abstract Map/Pattern Background */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                                </svg>
                            </div>

                            <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="opacity-80 font-medium mb-1">Current Status</p>
                                        <h4 className="text-2xl font-bold">
                                            {isCheckedIn ? "On Duty" : hasCompletedShift ? "Shift Done" : "Off Duty"}
                                        </h4>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl px-3 py-1.5 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-mono font-bold text-sm">
                                            {format(currentTime, "HH:mm")}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    {isCheckedIn ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-sm opacity-90">
                                                <MapPin className="w-4 h-4" />
                                                <span>Location Verified</span>
                                            </div>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20">
                                                        <LogOut className="mr-2 w-5 h-5" /> Check Out
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="w-[90%] rounded-3xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Finish Shift?</AlertDialogTitle>
                                                        <AlertDialogDescription>Are you sure you want to clock out?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl h-12">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleCheckOut} className="bg-blue-600 text-white rounded-xl h-12" disabled={checkOut.isPending}>
                                                            {checkOut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Confirm"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ) : hasCompletedShift ? (
                                        <Button disabled className="w-full bg-white/20 text-white h-14 rounded-2xl font-medium border-0">
                                            See you tomorrow!
                                        </Button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full ${locationStatus === 'valid' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                    <span className="text-sm font-medium opacity-90 text-slate-700 dark:text-slate-200">{statusMessage}</span>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                                    onClick={refreshLocation}
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${locationStatus === 'verifying' ? 'animate-spin' : ''}`} />
                                                </Button>
                                            </div>
                                            <Button
                                                onClick={handleCheckIn}
                                                disabled={locationStatus !== 'valid' || checkIn.isPending}
                                                className="w-full bg-white text-blue-600 hover:bg-blue-50 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20"
                                            >
                                                {checkIn.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Clock In"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming / Announcements */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Up Next</h3>
                            <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0 h-auto font-semibold">See All</Button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-sm border border-slate-100 dark:border-slate-800">
                            {tasks?.filter(t => t.status === 'pending').slice(0, 1).map((task) => (
                                <div key={task.id} className="flex gap-4 items-center cursor-pointer p-2 rounded-2xl transition-colors" onClick={() => navigate('/mobile/tasks')}>
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                        <CalendarDays className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{task.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">Due today by 5:00 PM</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wide">
                                                Priority
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <ChevronRight className="w-6 h-6" />
                                    </Button>
                                </div>
                            ))}
                            {(!tasks || tasks.filter(t => t.status === 'pending').length === 0) && (
                                <div className="p-8 text-center text-slate-400">
                                    <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No upcoming tasks</p>
                                </div>
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </EmployeeLayout>
    );
}
