import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { useCreateTask, useEmployees } from "@/api/employees";
import { useProducts } from "@/api/products";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { useContacts } from "@/api/contacts";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function AddTask() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const createTask = useCreateTask();
    const { data: employees } = useEmployees();
    const { data: products } = useProducts();
    const { data: allContacts } = useContacts();
    // Filter for Customers
    const contacts = allContacts?.filter(c => c.role === 'Customer' || c.role === 'Both') || [];
    const [openCombobox, setOpenCombobox] = useState(false);

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

    const draftKey = `task_form_draft_${location.pathname}`;

    const handleQuickAddService = () => {
        localStorage.setItem(draftKey, JSON.stringify(formData));
        const returnUrl = encodeURIComponent(location.pathname);
        navigate(`/services/add?returnUrl=${returnUrl}`);
    };

    const handleQuickAddCustomer = () => {
        localStorage.setItem(draftKey, JSON.stringify(formData));
        const returnUrl = encodeURIComponent(location.pathname);
        navigate(`/contacts/customers/add?returnUrl=${returnUrl}`);
    };

    useEffect(() => {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, [draftKey]);

    useEffect(() => {
        const newServiceId = searchParams.get("newService");
        if (newServiceId && services.length > 0) {
            const service = services.find(s => s.id === newServiceId);
            if (service) {
                setFormData(prev => ({
                    ...prev,
                    service_id: newServiceId,
                    title: service.name,
                    payment_amount: service.sale_price?.toString() || ""
                }));
                // Clear param
                setSearchParams(params => {
                    params.delete("newService");
                    return params;
                }, { replace: true });
            }
        }

        const newContactId = searchParams.get("newContact");
        if (newContactId && allContacts && allContacts.length > 0) {
            const contact = allContacts.find(c => c.id === newContactId);
            if (contact) {
                setFormData(prev => ({
                    ...prev,
                    customer_name: contact.name,
                    customer_phone: contact.phone || "",
                    customer_address: contact.address || ""
                }));
                // Clear param
                setSearchParams(params => {
                    params.delete("newContact");
                    return params;
                }, { replace: true });
            }
        }
    }, [services, allContacts, searchParams, setSearchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTask.mutateAsync({
                ...formData,
                payment_amount: formData.payment_amount ? parseFloat(formData.payment_amount) : 0,
                // If payment mode is empty string (if changed), handle it, but select forces value.
                payment_mode: formData.payment_mode || null
            });
            localStorage.removeItem(draftKey);
            navigate("/employees/tasks");
        } catch (error) {
            console.error("Failed", error);
        }
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Task</CardTitle>
                        <CardDescription>Assign a job to an employee</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="service">Select Service <span className="text-destructive">*</span></Label>
                                    <div className="flex gap-2">
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
                                            <SelectTrigger className="flex-1">
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleQuickAddService}
                                            title="Add New Service"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* Hidden title input or just rely on service name */}
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detailed instructions..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">Assign To <span className="text-destructive">*</span></Label>
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
                                    <Label htmlFor="customer_name">Customer Name <span className="text-destructive">*</span></Label>
                                    <div className="flex gap-2">
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCombobox}
                                                    className="w-full justify-between"
                                                >
                                                    {formData.customer_name
                                                        ? contacts?.find((c) => c.name === formData.customer_name)?.name || formData.customer_name
                                                        : "Select customer..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search customer..." />
                                                    <CommandList>
                                                        <CommandEmpty>No customer found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {contacts?.map((contact) => (
                                                                <CommandItem
                                                                    key={contact.id}
                                                                    value={contact.name}
                                                                    onSelect={(currentValue) => {
                                                                        setFormData({
                                                                            ...formData,
                                                                            customer_name: currentValue === formData.customer_name ? "" : currentValue,
                                                                            customer_phone: contact.phone || "",
                                                                            customer_address: contact.address || ""
                                                                        });
                                                                        setOpenCombobox(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formData.customer_name === contact.name ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {contact.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleQuickAddCustomer}
                                            title="Add New Customer"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <FloatingLabelInput
                                        id="customer_phone"
                                        label="Customer Phone"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <FloatingLabelInput
                                        id="customer_address"
                                        label="Customer Address"
                                        value={formData.customer_address}
                                        onChange={e => setFormData({ ...formData, customer_address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <FloatingLabelInput
                                        id="payment_amount"
                                        type="number"
                                        label="Amount to Collect (₹)"
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
