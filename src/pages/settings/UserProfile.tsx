import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { User, Loader2, LogOut, Phone, MapPin, Calendar, Clock, Mail, Edit, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCurrentEmployee } from "@/api/employees";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Employee } from "@/types/employee";

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

export default function UserProfile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: employee, isLoading: isLoadingEmployee } = useCurrentEmployee();

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    useEffect(() => {
        if (employee && !isEditing) {
            setPhone(employee.phone || "");
            setAddress(employee.address || "");
        }
    }, [employee, isEditing]);

    const handleProfileUpdate = async () => {
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

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = "/auth";
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    if (isLoadingEmployee) {
        return (
            <PageLayout>
                <div className="space-y-6 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-full" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Skeleton className="h-12 w-full" />
                </div>
            </PageLayout>
        );
    }

    const fallbackUser: Partial<Employee> = {
        full_name: "User",
        email: "user@example.com",
        role: "employee",
    };

    const displayUser: Partial<Employee> = employee || fallbackUser;

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl">

                {/* Personal Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {displayUser.full_name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0">
                                    <CardTitle>{displayUser.full_name}</CardTitle>
                                    <CardDescription>{displayUser.role === 'admin' ? 'Administrator' : 'Employee'}</CardDescription>
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
                                    {displayUser.full_name}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" /> Email
                                </Label>
                                <p className="font-medium break-all">
                                    {displayUser.email || "N/A"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" /> Joining Date
                                </Label>
                                <p className="font-medium">
                                    {displayUser.joining_date ? format(new Date(displayUser.joining_date), "PP") : "N/A"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" /> Shift Start
                                </Label>
                                <p className="font-medium">
                                    {displayUser.shift_start || "09:00 AM"}
                                </p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <FloatingLabelInput
                                            id="phone"
                                            label="Phone Number"
                                            className={!isEditing ? "bg-muted border-none pl-10" : "pl-10"}
                                            labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
                                            value={isEditing ? phone : (displayUser.phone || "Not set")}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <FloatingLabelInput
                                            id="address"
                                            label="Address"
                                            className={!isEditing ? "bg-muted border-none pl-10" : "pl-10"}
                                            labelClassName="peer-placeholder-shown:left-9 peer-focus:left-1"
                                            value={isEditing ? address : (displayUser.address || "Not set")}
                                            onChange={(e) => setAddress(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleProfileUpdate} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="pt-6">
                    <Button variant="destructive" className="w-full h-12 text-lg gap-2" onClick={() => setIsLogoutDialogOpen(true)}>
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Logout Confirmation */}
            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
}
