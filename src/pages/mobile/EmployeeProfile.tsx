import { useState, useEffect } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useCurrentEmployee } from "@/api/employees";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Calendar, Clock, Loader2, Save, Mail, Edit, X, LogOut } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
} from "@/components/ui/alert-dialog";

export default function EmployeeProfile() {
    const { data: employee, isLoading } = useCurrentEmployee();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    // Form State
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // Initialize form when data loads
    useEffect(() => {
        if (employee && !isEditing) {
            setPhone(employee.phone || "");
            setAddress(employee.address || "");
        }
    }, [employee, isEditing]);

    const handleSave = async () => {
        if (!employee) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("employees")
                .update({ phone, address })
                .eq("id", employee.id);

            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ["current_employee"] });
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <EmployeeLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </EmployeeLayout>
        );
    }

    if (!employee) {
        return (
            <EmployeeLayout>
                <div className="text-center p-8">
                    <p className="text-muted-foreground">Profile not found.</p>
                </div>
            </EmployeeLayout>
        );
    }

    return (
        <EmployeeLayout>
            <div className="space-y-6 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {employee.full_name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0">
                                    <CardTitle>{employee.full_name?.split(' ')[0]}</CardTitle>
                                    <CardDescription>{employee.role === 'admin' ? 'Administrator' : 'Employee'}</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(!isEditing)}
                                disabled={isSaving}
                            >
                                {isEditing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Read-Only Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" /> Full Name
                                </Label>
                                <p className="font-medium break-words">
                                    {employee.full_name}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" /> Email
                                </Label>
                                <p className="font-medium break-all">
                                    {employee.email || "N/A"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" /> Joining Date
                                </Label>
                                <p className="font-medium">
                                    {employee.joining_date ? format(new Date(employee.joining_date), "PP") : "N/A"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" /> Shift Start
                                </Label>
                                <p className="font-medium">
                                    {employee.shift_start || "09:00 AM"}
                                </p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    value={isEditing ? phone : (employee.phone || "Not set")}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                    className={!isEditing ? "bg-muted border-none" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Address
                                </Label>
                                <Input
                                    id="address"
                                    value={isEditing ? address : (employee.address || "Not set")}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={!isEditing}
                                    className={!isEditing ? "bg-muted border-none" : ""}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="pt-6">
                    <Button variant="destructive" className="w-full gap-2" onClick={() => setShowLogoutDialog(true)}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out of your account?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut} className="bg-destructive hover:bg-destructive/90">
                            Log Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </EmployeeLayout>
    );
}
