import { useState, useEffect } from "react";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import { useCurrentEmployee } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Calendar, Clock, Loader2, Save, Mail, Edit2, LogOut, ChevronRight, Store, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeProfile() {
    const { data: employee, isLoading } = useCurrentEmployee();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();
    const { signOut } = useAuth();
    const { theme, setTheme, color, setColor } = useTheme();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            navigate('/');
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Form State
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

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
            toast.success("Profile updated");
            setIsEditing(false);
        } catch (error: any) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <EmployeeLayout>
                <div className="flex justify-center items-center min-h-screen bg-[#F2F4F7]">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            </EmployeeLayout>
        );
    }

    if (!employee) return null;

    return (
        <EmployeeLayout>
            <div className="min-h-screen bg-[#F2F4F7] dark:bg-slate-950 pb-24 font-sans text-slate-800 dark:text-slate-100">

                {/* Profile Header */}
                <div className="relative pt-6 pb-8 px-6 bg-white dark:bg-slate-900 rounded-b-[3rem] shadow-sm mb-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-28 w-28 border-4 border-slate-50 dark:border-slate-800 shadow-xl">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold dark:text-white">
                                    {employee.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg bg-slate-900 text-white hover:bg-slate-800"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{employee.full_name}</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{employee.role}</p>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> Staff ID: {employee.id.slice(0, 6)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 space-y-6">

                    {/* Store Card */}
                    {employee.store && (
                        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Store className="w-24 h-24 transform translate-x-8 -translate-y-8" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Assigned Store</p>
                                <h3 className="text-xl font-bold leading-tight mb-1 text-white">{employee.store.name}</h3>
                                {employee.store.address && <p className="text-slate-400 text-sm">{employee.store.address}</p>}
                            </div>
                        </div>
                    )}

                    {/* Edit Form / Details */}
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm space-y-4"
                            >
                                <h3 className="font-bold text-lg mb-2">Edit Contact Info</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="dark:text-white">Phone Number</Label>
                                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 dark:text-white border-0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-white">Address</Label>
                                        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 dark:text-white border-0" />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="ghost" className="flex-1 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-xl" onClick={handleSave} disabled={isSaving}>
                                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white ml-2">Personal Information</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden">
                                    <InfoRow icon={<Mail className="w-5 h-5" />} label="Email" value={employee.email} />
                                    <InfoRow icon={<Phone className="w-5 h-5" />} label="Phone" value={employee.phone || "Not Set"} />
                                    <InfoRow icon={<MapPin className="w-5 h-5" />} label="Address" value={employee.address || "Not Set"} noBorder />
                                </div>

                                <h3 className="font-bold text-lg text-slate-900 dark:text-white ml-2 mt-6">Work Details</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden">
                                    <InfoRow icon={<Calendar className="w-5 h-5" />} label="Joined" value={format(new Date(employee.joining_date), "PP")} />
                                    <InfoRow icon={<Clock className="w-5 h-5" />} label="Shift Start" value={employee.shift_start || "09:00 AM"} noBorder />
                                </div>

                                <h3 className="font-bold text-lg text-slate-900 dark:text-white ml-2 mt-6">Appearance</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden p-5 space-y-5">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interface Theme</Label>
                                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full">
                                            {["light", "dark", "system"].map((t) => (
                                                <Button
                                                    key={t}
                                                    variant={theme === t ? "default" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setTheme(t as any)}
                                                    className={`capitalize flex-1 rounded-lg ${theme === t ? 'shadow-sm' : ''}`}
                                                >
                                                    {t}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accent Color</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { name: "blue", color: "#2563eb" },
                                                { name: "lavender", color: "#8B6B9E" },
                                                { name: "teal", color: "#0d9488" },
                                                { name: "forest", color: "#1e4620" },
                                                { name: "golden", color: "#d97706" },
                                                { name: "red", color: "#dc2626" },
                                                { name: "zinc", color: "#18181b" },
                                                { name: "pink", color: "#db2777" },
                                            ].map(({ name, color: bg }) => (
                                                <button
                                                    key={name}
                                                    onClick={() => setColor(name as any)}
                                                    className={cn(
                                                        "h-9 w-9 rounded-full ring-offset-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 disabled:opacity-50",
                                                        color === name ? "ring-2 ring-slate-900 dark:ring-white scale-110" : "ring-transparent",
                                                        "border border-white/20 shadow-sm"
                                                    )}
                                                    style={{ backgroundColor: bg }}
                                                    title={name.charAt(0).toUpperCase() + name.slice(1)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Logout Button */}
                    <div className="pt-4 pb-8">
                        <Button
                            variant="destructive"
                            className="w-full h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-50 font-bold text-lg shadow-none"
                            onClick={() => setShowLogoutDialog(true)}
                        >
                            Log Out
                        </Button>
                    </div>

                </div>
            </div>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="w-[90%] rounded-[2rem]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out of your account?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl h-11" disabled={isLoggingOut}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 rounded-xl h-11" disabled={isLoggingOut}>
                            {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Log Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </EmployeeLayout>
    );
}

function InfoRow({ icon, label, value, noBorder }: any) {
    return (
        <div className={`p-4 flex items-center gap-4 ${!noBorder ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="font-semibold text-slate-800 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
