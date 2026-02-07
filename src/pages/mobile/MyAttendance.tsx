import { useState } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useAttendance } from "@/api/employees";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, MapPin, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function MyAttendance() {
    // Current viewed month for calendar
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch all attendance (we'll filter client-side for this UI, or ideally fetch by range)
    // For now, fetching all as per previous logic, but filtering for display
    const { data: attendanceLogs } = useAttendance(null);

    const firstDayCurrentMonth = startOfMonth(currentMonth);
    const days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    });

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getLogForDate = (date: Date) => {
        return attendanceLogs?.find(log => isSameDay(new Date(log.date), date));
    };

    // Stats for the current month
    const currentMonthLogs = attendanceLogs?.filter(log => isSameMonth(new Date(log.date), currentMonth)) || [];
    const presentCount = currentMonthLogs.filter(l => l.status === 'present').length;
    const lateCount = currentMonthLogs.filter(l => l.status === 'late').length;
    const absentCount = currentMonthLogs.filter(l => l.status === 'absent').length;

    return (
        <EmployeeLayout>
            <div className="min-h-screen bg-[#F2F4F7] dark:bg-slate-950 pb-24 font-sans text-slate-800 dark:text-slate-100">

                <main className="px-6 pt-6 pb-4 space-y-6">

                    {/* Stats Row */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <StatCard label="Present" count={presentCount} color="bg-emerald-500" />
                        <StatCard label="Late" count={lateCount} color="bg-amber-500" />
                        <StatCard label="Absent" count={absentCount} color="bg-rose-500" />
                    </div>

                    {/* Calendar Section */}
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8 rounded-full hover:bg-slate-100">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full hover:bg-slate-100">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 text-center mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                    <div key={day} className="text-xs font-bold text-slate-300">{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-y-3">
                                {/* Padding for start of month */}
                                {Array.from({ length: getDay(firstDayCurrentMonth) }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {days.map((day, dayIdx) => {
                                    const log = getLogForDate(day);
                                    let statusColor = "bg-transparent text-slate-900";

                                    if (log) {
                                        if (log.status === 'present') statusColor = "bg-emerald-100 text-emerald-700 font-bold";
                                        else if (log.status === 'late') statusColor = "bg-amber-100 text-amber-700 font-bold";
                                        else if (log.status === 'absent') statusColor = "bg-rose-100 text-rose-700 font-bold";
                                        else if (log.status === 'half_day') statusColor = "bg-orange-100 text-orange-700 font-bold";
                                    }

                                    const isTodayDate = isSameDay(day, new Date());

                                    return (
                                        <div key={day.toString()} className="flex justify-center">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm relative
                                                ${statusColor}
                                                ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                            `}>
                                                {format(day, 'd')}
                                                {/* Dot indicator for logs */}
                                                {log && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${log.status === 'present' ? 'bg-emerald-500' :
                                                    log.status === 'late' ? 'bg-amber-500' :
                                                        log.status === 'absent' ? 'bg-rose-500' : 'bg-slate-400'
                                                    }`}></span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline History */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 ml-1">Daily Log</h3>
                        <div className="space-y-4">
                            {currentMonthLogs.length > 0 ? (
                                currentMonthLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                                    <div key={log.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold
                                                ${log.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                                    log.status === 'late' ? 'bg-amber-50 text-amber-600' :
                                                        log.status === 'absent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}
                                            `}>
                                                {format(new Date(log.date), 'dd')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white mb-0.5">
                                                    {format(new Date(log.date), 'EEEE')}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-emerald-500" />
                                                        {log.check_in ? format(new Date(log.check_in), "h:mm a") : '--:--'}
                                                    </span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-rose-500" />
                                                        {log.check_out ? format(new Date(log.check_out), "h:mm a") : 'Working'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <Badge variant="outline" className={`border-0 uppercase tracking-wider text-[10px] font-bold px-2 py-1 rounded-lg ${log.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                                log.status === 'late' ? 'bg-amber-50 text-amber-600' :
                                                    log.status === 'absent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                {log.status.replace('_', ' ')}
                                            </Badge>
                                            {log.location_check_in && <MapPin className="w-3 h-3 text-slate-300 ml-auto mt-2" />}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <p>No records for this month</p>
                                </div>
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </EmployeeLayout>
    );
}

function StatCard({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className="min-w-[100px] bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-50 flex flex-col items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-3xl font-black text-slate-900 dark:text-white">{count}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}
