import { useState } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useEmployeeTasks, useUpdateTask, useMyTodayAttendance } from "@/api/employees";
import { supabase } from "@/lib/supabase"; // Import supabase
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
import { ExpandableSearch } from "@/components/ui/expandable-search";

import { PageHeader } from "@/components/layout";

export default function MyTasks() {
    const { user } = useAuth();
    const { data: tasks, isLoading } = useEmployeeTasks(user?.id);
    const { data: todayAttendance } = useMyTodayAttendance();
    const updateTask = useUpdateTask();

    // Local state for 'reached_site' since it's not in the DB enum
    const [reachedSiteTasks, setReachedSiteTasks] = useState<Record<string, boolean>>(() => {
        // Initialize from localStorage
        try {
            const saved = localStorage.getItem('reachedSiteTasks');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const markReachedSite = (taskId: string) => {
        const newState = { ...reachedSiteTasks, [taskId]: true };
        setReachedSiteTasks(newState);
        localStorage.setItem('reachedSiteTasks', JSON.stringify(newState));
        toast({
            title: "Reached Site",
            description: "You have marked yourself as arrived.",
        });
    };

    // UI State
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

    // Payment Modal State
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [amountCollected, setAmountCollected] = useState("");
    const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        if (newStatus === 'accepted') {
            if (!todayAttendance) {
                toast({
                    title: "Check-in Required",
                    description: "You must check in for the day before accepting tasks.",
                    variant: "destructive"
                });
                return;
            }
            if (todayAttendance.check_out) {
                toast({
                    title: "Shift Ended",
                    description: "You have checked out for the day. Cannot accept new tasks.",
                    variant: "destructive"
                });
                return;
            }
        }

        setUpdatingTaskId(taskId);

        // Clean up local state if moving away from accepted/reached
        if (newStatus !== 'accepted') {
            const newState = { ...reachedSiteTasks };
            delete newState[taskId];
            setReachedSiteTasks(newState);
            localStorage.setItem('reachedSiteTasks', JSON.stringify(newState));
        }

        try {
            await updateTask.mutateAsync({
                id: taskId,
                updates: { status: newStatus as any }
            });
        } catch (error) {
            // Error handling handled by mutation typically, but we clear loading here
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleCompleteTask = async () => {
        if (!selectedTask) return;

        // Validate inputs
        if (!amountCollected) {
            toast({ title: "Please enter amount collected", variant: "destructive" });
            return;
        }

        const task = tasks?.find(t => t.id === selectedTask);
        if (!task) return;

        try {
            // 1. Update Task Status
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

            // 2. Generate Sales Invoice
            try {
                // A. Check/Create Customer
                let customerId = "";
                // First try to find by phone
                if (task.customer_phone) {
                    const { data: existingCustomers } = await supabase
                        .from('contacts')
                        .select('id')
                        .eq('phone', task.customer_phone)
                        .limit(1);

                    if (existingCustomers && existingCustomers.length > 0) {
                        customerId = existingCustomers[0].id;
                    }
                }

                // If not found, create new contact
                if (!customerId) {
                    const { data: newCustomer, error: createCustomerError } = await supabase
                        .from('contacts')
                        .insert({
                            name: task.customer_name || "Unknown Customer",
                            phone: task.customer_phone || "",
                            address: task.customer_address || ""
                        })
                        .select('id')
                        .single();

                    if (createCustomerError) throw createCustomerError;
                    customerId = newCustomer.id;
                }

                // B. Check/Create "Service" Product
                let serviceProductId = "";
                const { data: serviceProducts } = await supabase
                    .from('products')
                    .select('id')
                    .ilike('name', 'Service')
                    .limit(1);

                if (serviceProducts && serviceProducts.length > 0) {
                    serviceProductId = serviceProducts[0].id;
                } else {
                    // Create Service Product
                    const { data: newServiceProduct, error: createProductError } = await supabase
                        .from('products')
                        .insert({
                            name: "Service",
                            description: "General Service Charge",
                            sale_price: 0, // Variable price
                            is_tax_inclusive: false,
                            is_online: false
                        })
                        .select('id')
                        .single();

                    if (createProductError) throw createProductError;
                    serviceProductId = newServiceProduct.id;
                }

                // C. Create Sales Order (Invoice)
                const saleData = {
                    order_no: `INV-${Date.now()}`, // Simple ID generation
                    customer_id: customerId,
                    order_date: new Date().toISOString(),
                    status: 'Completed',
                    total_amount: Number(amountCollected),
                    payment_status: 'Paid',
                    notes: `Generated from Task: ${task.title}`
                };

                // Add store_id to saleData if activeStoreId is available (assuming it's handled by RLS or defaulting to null, 
                // but strictly we should pass it if we have access. Since we are in employee view, we might not have activeStoreId explicitly selected in Redux in the same way as Admin.
                // However, tasks are usually store-agnostic or RLS handles it. 
                // Let's check imports. We don't have useAppSelector imported. Let's rely on RLS/Default or fetch user's store?
                // Actually, let's keep it simple. If we need store_id, we might need to fetch it from the task or user profile.
                // For now, let's insert standard fields.

                const { data: saleOrder, error: saleError } = await supabase
                    .from('sales_orders')
                    .insert(saleData)
                    .select('id')
                    .single();

                if (saleError) throw saleError;

                // D. Create Sales Item
                const { error: itemError } = await supabase
                    .from('sales_items')
                    .insert({
                        sale_id: saleOrder.id,
                        product_id: serviceProductId,
                        quantity: 1,
                        unit_price: Number(amountCollected),
                        subtotal: Number(amountCollected),
                        tax_amount: 0 // Assuming 0 for now
                    });

                if (itemError) throw itemError;

                // E. Create Sales Payment
                const { error: paymentError } = await supabase
                    .from('sales_payments')
                    .insert({
                        sale_id: saleOrder.id,
                        amount: Number(amountCollected),
                        payment_date: new Date().toISOString(),
                        payment_method: paymentMode,
                        notes: "Auto-generated payment from task completion"
                    });

                if (paymentError) throw paymentError;

                toast({ title: "Task Completed & Invoice Generated", description: "Invoice has been created successfully." });

            } catch (invoiceError) {
                console.error("Invoice generation failed:", invoiceError);
                toast({ title: "Task Completed", description: "Warning: Invoice generation failed.", variant: "destructive" });
            }

            setSelectedTask(null);
            setAmountCollected("");
        } catch (error) {
            toast({ title: "Error completing task", variant: "destructive" });
        }
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
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search tasks..."
            />
            <div className=""> {/* Removed gap-4 from parent container to let Tabs handle spacing */}
                <div className="flex flex-col gap-4 sticky top-0 bg-background z-10 pb-4 pt-2">

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "history")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
                            <TabsTrigger value="history">History ({completedTasks.length})</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="pb-24 px-4 space-y-6">
                    {activeTab === 'active' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTasks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {searchQuery ? "No matching active tasks found." : "No active tasks assigned."}
                                </div>
                            ) : (
                                activeTasks.map(task => (
                                    <Card key={task.id} className="overflow-hidden border-0 shadow-md rounded-2xl relative group">
                                        <CardContent className="p-5 space-y-4">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg leading-tight">{task.title}</h3>
                                                <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'} className="capitalize shrink-0">
                                                    {task.status.replace('_', ' ')}
                                                </Badge>
                                            </div>

                                            {/* Customer & Location */}
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-full mt-0.5 shrink-0">
                                                        <MapPin className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{task.customer_name}</p>
                                                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{task.customer_address}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description (Optional) */}
                                            {task.description && (
                                                <div className="bg-muted/30 p-3 rounded-xl text-sm text-foreground/80 border border-border/50">
                                                    {task.description}
                                                </div>
                                            )}

                                            {/* Payment Info */}
                                            {task.payment_amount && task.payment_amount > 0 && (
                                                <div className="flex items-center gap-2 font-bold text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                    <IndianRupee className="w-4 h-4" />
                                                    <span>To Collect:</span>
                                                    <span className="text-lg">₹{task.payment_amount}</span>
                                                </div>
                                            )}
                                        </CardContent>

                                        {/* Action Buttons */}
                                        <div className="px-5 pb-5">
                                            {task.status === 'pending' && (
                                                <Button
                                                    size="lg"
                                                    className="w-full font-semibold shadow-lg shadow-primary/20"
                                                    onClick={() => handleStatusChange(task.id, 'accepted')}
                                                    disabled={updatingTaskId === task.id || updateTask.isPending}
                                                >
                                                    {updatingTaskId === task.id ? "Accepting..." : "Accept Task"}
                                                </Button>
                                            )}

                                            {task.status === 'accepted' && (
                                                <>
                                                    {/* If NOT reached site yet */}
                                                    {!reachedSiteTasks[task.id] && (
                                                        <div className="flex gap-3">
                                                            <Button variant="outline" size="lg" className="flex-1 border-primary/20 text-primary hover:bg-primary/5" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.customer_address || "")}`)}>
                                                                <Navigation className="w-4 h-4 mr-2" /> Navigate
                                                            </Button>
                                                            <Button
                                                                size="lg"
                                                                className="flex-[2] shadow-lg shadow-primary/20"
                                                                onClick={() => markReachedSite(task.id)}
                                                            >
                                                                Reached Site
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* If Reached Site (Local State) */}
                                                    {reachedSiteTasks[task.id] && (
                                                        <div className="relative w-full h-14 bg-muted/50 rounded-full overflow-hidden border border-primary/20 select-none touch-none">
                                                            {/* Background Text */}
                                                            <div className="absolute inset-0 flex items-center justify-center text-primary/50 font-semibold tracking-widest text-sm uppercase">
                                                                Slide to Start Work
                                                            </div>
                                                            <SwipeSlider onComplete={() => handleStatusChange(task.id, 'in_progress')} isLoading={updateTask.isPending} />
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {task.status === 'in_progress' && (
                                                <div className="w-full">
                                                    {selectedTask === task.id ? (
                                                        <div className="space-y-4 pt-4 border-t border-dashed mt-2 animate-in fade-in slide-in-from-top-2">
                                                            <div className="space-y-3">
                                                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Collection & Completion</Label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label htmlFor="amt" className="text-xs font-medium">Amount (₹)</Label>
                                                                        <Input
                                                                            id="amt"
                                                                            type="number"
                                                                            placeholder="0.00"
                                                                            value={amountCollected}
                                                                            onChange={(e) => setAmountCollected(e.target.value)}
                                                                            autoFocus
                                                                            className="h-10 rounded-lg"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-xs font-medium">Mode</Label>
                                                                        <Select value={paymentMode} onValueChange={(v: any) => setPaymentMode(v)}>
                                                                            <SelectTrigger className="h-10 rounded-lg">
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

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="lg"
                                                                    className="flex-1"
                                                                    onClick={() => {
                                                                        setSelectedTask(null);
                                                                        setAmountCollected("");
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="lg"
                                                                    className="flex-[2]"
                                                                    onClick={handleCompleteTask}
                                                                    disabled={updateTask.isPending}
                                                                >
                                                                    {updateTask.isPending ? "Submitting..." : "Finish Task"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="lg"
                                                            className="w-full font-semibold shadow-lg shadow-primary/20"
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
                                        </div>
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

// Inline Swipe Slider Component for "Swipe to Start"
function SwipeSlider({ onComplete, isLoading }: { onComplete: () => void, isLoading: boolean }) {
    const [sliderValue, setSliderValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseInt(e.target.value));
    };

    const handleEnd = () => {
        setIsDragging(false);
        if (sliderValue >= 95) {
            setSliderValue(100);
            onComplete();
        } else {
            setSliderValue(0);
        }
    };

    return (
        <div className="relative w-full h-14 bg-muted rounded-full overflow-hidden border border-primary/20 shadow-inner">
            {/* Success Fill */}
            <div
                className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-75 ease-linear"
                style={{ width: `${sliderValue}%` }}
            />

            {/* Text */}
            <div className={`absolute inset-0 flex items-center justify-center font-semibold tracking-widest text-sm uppercase pointer-events-none transition-opacity duration-300 ${sliderValue > 50 ? 'opacity-0' : 'text-primary/60 animate-pulse'}`}>
                {isLoading ? "Starting..." : "Swipe to Start"}
            </div>

            {/* Thumb Visual */}
            <div
                className="absolute top-1 bottom-1 w-12 bg-primary rounded-full flex items-center justify-center shadow-md pointer-events-none transition-all duration-75 ease-linear"
                style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.48}px + 4px)` }} // Adjust for thumb width + padding
            >
                <div className="text-primary-foreground">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </div>
            </div>

            {/* Input Range Overlay */}
            <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleInput}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={handleEnd}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={handleEnd}
                disabled={isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
        </div>
    );
}
