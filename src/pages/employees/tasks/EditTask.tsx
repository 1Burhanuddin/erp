import { useEffect, useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useEmployees, useUpdateTask } from "@/api/employees"; // Need update/delete hooks
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TaskStatus, PaymentStatus, PaymentMode } from "@/types/employee";
import { supabase } from "@/lib/supabase";

export default function EditTask() {
    const { id } = useParams();
    const navigate = useNavigate();
    const updateTask = useUpdateTask(); // You might need to check if this hook exists or create it
    const { data: employees } = useEmployees();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        employee_id: "",
        title: "",
        description: "",
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        payment_amount: "",
        amount_collected: "",
        status: "pending" as TaskStatus,
        payment_status: "pending" as PaymentStatus,
        payment_mode: "cash" as PaymentMode // Default
    });

    useEffect(() => {
        if (!id) return;
        const fetchTask = async () => {
            const { data, error } = await supabase
                .from("employee_tasks")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                toast({ title: "Error", description: "Could not load task", variant: "destructive" });
                navigate("/employees/tasks");
                return;
            }
            if (data) {
                setFormData({
                    employee_id: data.employee_id || "",
                    title: data.title,
                    description: data.description || "",
                    customer_name: data.customer_name || "",
                    customer_phone: data.customer_phone || "",
                    customer_address: data.customer_address || "",
                    payment_amount: data.payment_amount?.toString() || "",
                    amount_collected: data.amount_collected?.toString() || "",
                    status: data.status,
                    payment_status: data.payment_status || "pending",
                    payment_mode: data.payment_mode || "cash"
                });
            }
            setFetching(false);
        };
        fetchTask();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateTask.mutateAsync({
                id: id!,
                updates: {
                    ...formData,
                    payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : 0,
                    amount_collected: formData.amount_collected ? parseFloat(formData.amount_collected) : 0,
                }
            });
            navigate("/employees/tasks");
        } catch (error: any) {
            // Error handled by hook
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("employee_tasks").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Task deleted" });
            navigate("/employees/tasks");
        } catch (error: any) {
            toast({ title: "Error deleting", description: error.message, variant: "destructive" });
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <PageLayout>
            <PageHeader
                title="Edit Task"
                description="Update assignment details"
                actions={
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                        <Trash2 className="w-4 h-4" /> Delete Task
                    </Button>
                }
            />
            <div className="max-w-3xl mx-auto p-6">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title">Task Title</Label>
                                    <Input
                                        id="title"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">Assign To</Label>
                                    <Select
                                        value={formData.employee_id}
                                        onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees?.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v: TaskStatus) => setFormData({ ...formData, status: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="accepted">Accepted</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Customer Name</Label>
                                    <Input
                                        id="customer_name"
                                        value={formData.customer_name}
                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone">Customer Phone</Label>
                                    <Input
                                        id="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="customer_address">Customer Address</Label>
                                    <Input
                                        id="customer_address"
                                        value={formData.customer_address}
                                        onChange={e => setFormData({ ...formData, customer_address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                                    <Label htmlFor="payment_amount">Amount to Collect (₹)</Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        min="0"
                                        value={formData.payment_amount}
                                        onChange={e => setFormData({ ...formData, payment_amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                                    <Label htmlFor="amount_collected">Amount Collected (₹)</Label>
                                    <Input
                                        id="amount_collected"
                                        type="number"
                                        min="0"
                                        value={formData.amount_collected}
                                        onChange={e => setFormData({ ...formData, amount_collected: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/employees/tasks")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
