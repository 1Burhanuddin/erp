import { useEffect, useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useEmployees, useCreateEmployee } from "@/api/employees"; // Need update/delete hooks
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { EmployeeRole } from "@/types/employee";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";

export default function EditEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address: "",
        role: "employee" as EmployeeRole,
        shift_start: "09:00",
        status: "active" as "active" | "inactive"
    });

    useEffect(() => {
        if (!id) return;
        const fetchEmployee = async () => {
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                toast({ title: "Error", description: "Could not load employee", variant: "destructive" });
                navigate("/employees/list");
                return;
            }
            if (data) {
                setFormData({
                    full_name: data.full_name,
                    phone: data.phone || "",
                    address: data.address || "",
                    role: data.role,
                    shift_start: data.shift_start || "09:00",
                    status: data.status as "active" | "inactive"
                });
            }
            setFetching(false);
        };
        fetchEmployee();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from("employees")
                .update(formData)
                .eq("id", id);

            if (error) throw error;

            toast({ title: "Updated successfully" });
            navigate("/employees/list");
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        // Dialog handles confirmation now
        setLoading(true);
        try {
            const { error } = await supabase.from("employees").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Employee deleted" });
            navigate("/employees/list");
        } catch (error: any) {
            toast({ title: "Error deleting", description: error.message, variant: "destructive" });
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    if (fetching) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <PageLayout>
            <PageHeader
                title="Edit Employee"
                description={`Managing ${formData.full_name}`}
                actions={
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="gap-2">
                        <Trash2 className="w-4 h-4" /> Delete Employee
                    </Button>
                }
            />
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                                <Input
                                    id="phone"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(v: EmployeeRole) => setFormData({ ...formData, role: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v: "active" | "inactive") => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shift_start">Shift Start Time</Label>
                                <Input
                                    id="shift_start"
                                    type="time"
                                    value={formData.shift_start}
                                    onChange={e => setFormData({ ...formData, shift_start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate("/employees/list")}>
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

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
}
