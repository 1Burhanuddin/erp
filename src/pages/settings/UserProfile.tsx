import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, LogOut, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUpdateProfile, useUpdatePassword } from "@/api/profile";
import { toast } from "sonner";
import { SettingsField, BusinessActionButtons } from "@/components/settings/SettingsCommon";
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

export default function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true);

    // Password state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const updateProfileMutation = useUpdateProfile();
    const updatePasswordMutation = useUpdatePassword();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setFullName(user?.user_metadata?.full_name || "");
            setLoading(false);
        };
        getUser();
    }, []);

    const handleProfileUpdate = () => {
        updateProfileMutation.mutate({ full_name: fullName }, {
            onSuccess: () => {
                setIsEditingProfile(false);
                toast.success("Profile updated");
            }
        });
    };

    const handlePasswordUpdate = () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        updatePasswordMutation.mutate(password, {
            onSuccess: () => {
                setPassword("");
                setConfirmPassword("");
            }
        });
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = "/auth";
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    if (loading) {
        return <PageLayout><PageHeader title="User Profile" description="Loading..." /></PageLayout>;
    }

    return (
        <PageLayout>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
                <p className="text-muted-foreground">Manage your personal details and security.</p>
            </div>

            <div className="space-y-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <SettingsField
                                label="Full Name"
                                value={fullName}
                                onChange={setFullName}
                                isEditing={isEditingProfile}
                                placeholder="Your full name"
                            />
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="p-2 border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center px-3 opacity-70 cursor-not-allowed">
                                    {user?.email || ""}
                                </div>
                                <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                            </div>
                        </div>
                        <BusinessActionButtons
                            isEditing={isEditingProfile}
                            onEdit={() => setIsEditingProfile(true)}
                            onCancel={() => { setIsEditingProfile(false); setFullName(user?.user_metadata?.full_name || ""); }}
                            onSave={handleProfileUpdate}
                            isPending={updateProfileMutation.isPending}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Update your password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handlePasswordUpdate} disabled={updatePasswordMutation.isPending || !password}>
                                {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Sign out of your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            onClick={() => setIsLogoutDialogOpen(true)}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>

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
