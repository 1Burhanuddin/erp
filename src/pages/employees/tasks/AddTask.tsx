import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCreateTask, useEmployees } from "@/api/employees";
import { useProducts } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TaskStatus, PaymentStatus, PaymentMode } from "@/types/employee";

export default function AddTask() {
    const navigate = useNavigate();
    const createTask = useCreateTask();
    const { data: employees } = useEmployees();
    const { data: products } = useProducts();

    // Filter for Services
    const services = products?.filter(p => (p as any).type === 'Service') || [];

    const [formData, setFormData] = useState({
        employee_id: "",
        service_id: "", // New field
        title: "",
        description: "",
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        payment_amount: "",
        status: "pending" as TaskStatus,
        payment_status: "pending" as PaymentStatus,
        payment_mode: "cash" as PaymentMode // Default
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTask.mutateAsync({
                ...formData,
                payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : 0,
                // If payment mode is empty string (if changed), handle it, but select forces value.
                payment_mode: formData.payment_mode || null
            });
            navigate("/employees/tasks");
        } catch (error) {
            console.error("Failed", error);
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Create New Task"
                description="Assign a job to an employee"
            />
            <div className="max-w-3xl mx-auto p-2">
                <Card>
                    <CardContent className="pt-4 px-4 overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="service">Select Service</Label>
                                    <Select
                                        value={formData.service_id}
                                        onValueChange={(serviceId) => {
                                            const service = services.find(s => s.id === serviceId);
                                            if (service) {
                                                setFormData({
                                                    ...formData,
                                                    service_id: serviceId,
                                                    title: service.name,
                                                    payment_amount: service.sale_price?.toString() || ""
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map(service => (
                                                <SelectItem key={service.id} value={service.id}>
                                                    {service.name} (₹{service.sale_price})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Hidden title input or just rely on service name */}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detailed instructions..."
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
                                    <Label htmlFor="status">Initial Status</Label>
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

                                <div className="space-y-2">
                                    <Label htmlFor="payment_amount">Amount to Collect (₹)</Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        min="0"
                                        value={formData.payment_amount}
                                        onChange={e => setFormData({ ...formData, payment_amount: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/employees/tasks")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createTask.isPending}>
                                    {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Task
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
