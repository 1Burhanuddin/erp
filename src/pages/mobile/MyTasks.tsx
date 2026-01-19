import { useState } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useEmployeeTasks, useUpdateTask } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Navigation, IndianRupee } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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

export default function MyTasks() {
    const { user } = useAuth();
    const { data: tasks, isLoading } = useEmployeeTasks(user?.id);
    const updateTask = useUpdateTask();

    // Payment Modal State
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [amountCollected, setAmountCollected] = useState("");
    const [paymentMode, setPaymentMode] = useState<"cash" | "online">("cash");

    const handleStatusChange = (taskId: string, newStatus: string) => {
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

        // Logic: Status -> completed, Payment -> partial/paid based on amount
        // Ideally compare with task.payment_amount manually or backend logic
        // For now we just save what they entered

        await updateTask.mutateAsync({
            id: selectedTask,
            updates: {
                status: 'completed',
                completed_at: new Date().toISOString(),
                amount_collected: Number(amountCollected),
                payment_mode: paymentMode,
                payment_status: 'paid' // Simplified for demo
            }
        });

        setSelectedTask(null);
        setAmountCollected("");
    };

    const activeTasks = tasks?.filter(t => !['completed', 'cancelled'].includes(t.status)) || [];
    const completedTasks = tasks?.filter(t => ['completed', 'cancelled'].includes(t.status)) || [];

    return (
        <EmployeeLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">My Tasks</h1>

                {/* Active Tasks */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active ({activeTasks.length})</h2>
                    {activeTasks.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">No active tasks assigned.</p>
                    ) : (
                        activeTasks.map(task => (
                            <Card key={task.id} className="overflow-hidden">
                                <CardHeader className="p-4 pb-2 bg-muted/20">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base">{task.title}</CardTitle>
                                        <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'} className="capitalize">
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">{task.customer_name}</p>
                                            <p className="text-sm text-muted-foreground">{task.customer_address}</p>
                                        </div>
                                    </div>

                                    {task.status !== 'pending' && ( // Hide phone for pending tasks? Or show always? Plan said hide for completed.
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                            <a href={`tel:${task.customer_phone}`} className="text-sm text-blue-600 hover:underline">
                                                {task.customer_phone}
                                            </a>
                                        </div>
                                    )}

                                    <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                                        {task.description || "No description provided."}
                                    </div>

                                    {task.payment_amount && task.payment_amount > 0 && (
                                        <div className="flex items-center gap-2 font-medium text-green-700">
                                            <IndianRupee className="w-4 h-4" />
                                            Collect: {task.payment_amount}
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
                                        <Dialog open={selectedTask === task.id} onOpenChange={(open) => !open && setSelectedTask(null)}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full" variant="default" onClick={() => setSelectedTask(task.id)}>
                                                    Complete & Collect Payment
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Complete Task: {task.title}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Amount Collected (Target: ₹{task.payment_amount})</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Enter amount"
                                                            value={amountCollected}
                                                            onChange={(e) => setAmountCollected(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Payment Mode</Label>
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
                                                    <Button
                                                        className="w-full"
                                                        onClick={handleCompleteTask}
                                                        disabled={updateTask.isPending}
                                                    >
                                                        {updateTask.isPending ? "Submitting..." : "Submit & Finish"}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* History / Completed */}
                <div className="space-y-4 pt-6 text-opacity-50 opacity-70">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Completed Today</h2>
                    {completedTasks.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">No completed tasks yet.</p>
                    ) : (
                        completedTasks.map(task => (
                            <Card key={task.id} className="bg-gray-50">
                                <CardHeader className="p-4">
                                    <div className="flex justify-between">
                                        <CardTitle className="text-sm text-muted-foreground">{task.title}</CardTitle>
                                        <Badge variant="outline">Done</Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>

            </div>
        </EmployeeLayout>
    );
}
