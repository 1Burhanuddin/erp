import { useState } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useEmployeeTasks, useUpdateTask, useMyTodayAttendance } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Navigation, IndianRupee, History, Calendar, Search, Filter, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { format, isToday, parseISO, isYesterday, isSameWeek, isSameMonth, subWeeks, isBefore, startOfDay, subDays } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MyTasks() {
    const { user } = useAuth();
    const { data: tasks, isLoading } = useEmployeeTasks(user?.id);
    const { data: todayAttendance } = useMyTodayAttendance();
    const updateTask = useUpdateTask();

    // UI State
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [searchQuery, setSearchQuery] = useState("");

    // Payment Modal State
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [amountCollected, setAmountCollected] = useState("");
    const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");

    const handleStatusChange = (taskId: string, newStatus: string) => {
        if (newStatus === 'accepted' && !todayAttendance) {
            toast({
                title: "Check-in Required",
                description: "You must check in for the day before accepting tasks.",
                variant: "destructive"
            });
            return;
        }

        updateTask.mutate({
            id: taskId,
            updates: { status: newStatus as any }
        });
    };

    const handleCompleteTask = async () => {
        if (!selectedTask) return;

        // Validate inputs
        if (!amountCollected) {
            toast({ title: "Please enter amount collected", variant: "destructive" });
            return;
        }

        await updateTask.mutateAsync({
            id: selectedTask,
            updates: {
                status: 'completed',
                completed_at: new Date().toISOString(),
                amount_collected: Number(amountCollected),
                payment_mode: paymentMode,
                payment_status: 'paid'
            }
        });

        setSelectedTask(null);
        setAmountCollected("");
    };

    // Filter Logic
    const filteredTasks = tasks?.filter(t => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                t.title?.toLowerCase().includes(query) ||
                t.customer_name?.toLowerCase().includes(query) ||
                t.customer_phone?.includes(query);
            if (!matchesSearch) return false;
        }
        return true;
    }) || [];

    const activeTasks = filteredTasks.filter(t => !['completed', 'cancelled'].includes(t.status));
    const completedTasks = filteredTasks.filter(t => ['completed', 'cancelled'].includes(t.status));

    // History Grouping Logic
    const now = new Date();

    const historyToday = completedTasks.filter(t => t.completed_at && isToday(parseISO(t.completed_at)));
    const historyYesterday = completedTasks.filter(t => t.completed_at && isYesterday(parseISO(t.completed_at)));

    // This week (including today and yesterday as requested)
    const historyThisWeek = completedTasks.filter(t => {
        if (!t.completed_at) return false;
        const d = parseISO(t.completed_at);
        return isSameWeek(d, now, { weekStartsOn: 1 });
    });

    // Last Week
    const historyLastWeek = completedTasks.filter(t => {
        if (!t.completed_at) return false;
        const d = parseISO(t.completed_at);
        const lastWeek = subWeeks(now, 1);
        return isSameWeek(d, lastWeek, { weekStartsOn: 1 });
    });

    // Older (Everything else)
    const historyOlder = completedTasks.filter(t => {
        if (!t.completed_at) return false;
        const d = parseISO(t.completed_at);
        return !isSameWeek(d, now, { weekStartsOn: 1 }) &&
            !isSameWeek(d, subWeeks(now, 1), { weekStartsOn: 1 });
    });

    const renderHistorySection = (title: string, tasks: typeof completedTasks, icon?: React.ReactNode) => {
        if (tasks.length === 0) return null;
        return (
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    {icon} {title}
                </h3>
                {tasks.map(task => (
                    <Card key={task.id} className="bg-card border-border/60">
                        <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-sm font-medium text-foreground">{task.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{task.customer_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                            {task.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            {task.completed_at ? format(parseISO(task.completed_at), "MMM d, h:mm a") : ''}
                                        </span>
                                    </div>
                                </div>
                                {task.amount_collected && (
                                    <div className="text-right">
                                        <div className="text-xs font-medium text-green-700 flex items-center justify-end gap-0.5">
                                            <IndianRupee className="w-3 h-3" /> {task.amount_collected}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground capitalize">
                                            {task.payment_mode}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <EmployeeLayout>
            <div className=""> {/* Removed gap-4 from parent container to let Tabs handle spacing */}
                <div className="flex flex-col gap-4 sticky top-0 bg-background z-10 pb-4 pt-2">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">My Tasks</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 bg-muted/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "history")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
                            <TabsTrigger value="history">History ({completedTasks.length})</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="pb-20"> {/* Add padding for bottom nav if exists, or just spacing */}
                    {activeTab === 'active' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTasks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {searchQuery ? "No matching active tasks found." : "No active tasks assigned."}
                                </div>
                            ) : (
                                activeTasks.map(task => (
                                    <Card key={task.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm bg-card">
                                        <CardHeader className="p-4 pb-2 bg-muted/20">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
                                                <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'} className="capitalize">
                                                    {task.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-100 p-1.5 rounded-full shrink-0">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{task.customer_name}</p>
                                                    <p className="text-sm text-muted-foreground leading-snug">{task.customer_address}</p>
                                                </div>
                                            </div>

                                            {task.status !== 'pending' && (
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-green-100 p-1.5 rounded-full shrink-0">
                                                        <Phone className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <a href={`tel:${task.customer_phone}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                                                        {task.customer_phone}
                                                    </a>
                                                </div>
                                            )}

                                            {task.description && (
                                                <div className="bg-muted/30 p-3 rounded text-sm text-foreground/80 border">
                                                    {task.description}
                                                </div>
                                            )}

                                            {task.payment_amount && task.payment_amount > 0 && (
                                                <div className="flex items-center gap-2 font-medium text-green-700 bg-green-50 p-2 rounded border border-green-100">
                                                    <IndianRupee className="w-4 h-4" />
                                                    To Collect: <span className="font-bold">₹{task.payment_amount}</span>
                                                </div>
                                            )}

                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 flex gap-2">
                                            {task.status === 'pending' && (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => handleStatusChange(task.id, 'accepted')}
                                                    disabled={updateTask.isPending}
                                                >
                                                    {updateTask.isPending ? "Accepting..." : "Accept Task"}
                                                </Button>
                                            )}

                                            {task.status === 'accepted' && (
                                                <>
                                                    <Button variant="outline" className="flex-1" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.customer_address || "")}`)}>
                                                        <Navigation className="w-4 h-4 mr-2" /> Navigate
                                                    </Button>
                                                    <Button
                                                        className="flex-1"
                                                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                                                        disabled={updateTask.isPending}
                                                    >
                                                        {updateTask.isPending ? "Starting..." : "Start Work"}
                                                    </Button>
                                                </>
                                            )}

                                            {task.status === 'in_progress' && (
                                                <div className="w-full">
                                                    {selectedTask === task.id ? (
                                                        <div className="space-y-4 pt-4 border-t mt-2 animate-in fade-in slide-in-from-top-2">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Collection Details</Label>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="amt" className="text-xs">Amount (₹)</Label>
                                                                        <Input
                                                                            id="amt"
                                                                            type="number"
                                                                            placeholder="0.00"
                                                                            value={amountCollected}
                                                                            onChange={(e) => setAmountCollected(e.target.value)}
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs">Mode</Label>
                                                                        <Select value={paymentMode} onValueChange={(v: any) => setPaymentMode(v)}>
                                                                            <SelectTrigger>
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="cash">Cash</SelectItem>
                                                                                <SelectItem value="online">Online (UPI)</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 pt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1"
                                                                    onClick={() => {
                                                                        setSelectedTask(null);
                                                                        setAmountCollected("");
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    className="flex-1"
                                                                    onClick={handleCompleteTask}
                                                                    disabled={updateTask.isPending}
                                                                >
                                                                    {updateTask.isPending ? "Submitting..." : "Finish Task"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            className="w-full"
                                                            variant="default"
                                                            onClick={() => {
                                                                setSelectedTask(task.id);
                                                                setAmountCollected(task.payment_amount?.toString() || "");
                                                            }}
                                                        >
                                                            Complete & Collect Payment
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            {completedTasks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {searchQuery ? "No matching completed tasks found." : "No completed tasks yet."}
                                </div>
                            ) : (
                                <>
                                    {renderHistorySection("Today", historyToday, <Calendar className="w-3 h-3" />)}
                                    {renderHistorySection("Yesterday", historyYesterday, <Clock className="w-3 h-3" />)}
                                    {renderHistorySection("This Week", historyThisWeek, <History className="w-3 h-3" />)}
                                    {renderHistorySection("Last Week", historyLastWeek, <History className="w-3 h-3" />)}
                                    {renderHistorySection("Older Tasks", historyOlder, <History className="w-3 h-3" />)}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}
