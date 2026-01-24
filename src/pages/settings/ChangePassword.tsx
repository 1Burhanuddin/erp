import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useUpdatePassword } from "@/api/profile";
import { toast } from "sonner";
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

export default function ChangePassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    const updatePasswordMutation = useUpdatePassword();

    const initiatePasswordUpdate = () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsPasswordDialogOpen(true);
    };

    const confirmPasswordUpdate = () => {
        updatePasswordMutation.mutate(password, {
            onSuccess: () => {
                setPassword("");
                setConfirmPassword("");
                setIsPasswordDialogOpen(false);
            }
        });
    };

    return (
        <PageLayout>
            <div className="space-y-6 w-full mt-4">

                <Card>
                    <CardHeader>
                        <CardTitle>New Credentials</CardTitle>
                        <CardDescription>Enter your new password below. You will be required to sign in again after this change.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="pr-10"
                                    />
                                    {/* Optional: Add toggle here too, or relying on the first one is enough? 
                                        Usually one toggle for the "form" is okay, or separate. 
                                        I'll add it here too but mapped to the same state for consistency with typical "Show Password" checkboxes, 
                                        OR I can make them independent. 
                                        Given the user asked "view pass word", a single toggle often implies showing both. 
                                        Let's stick to the single state controlling both, repeated button for convenience.
                                    */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={initiatePasswordUpdate}
                                disabled={updatePasswordMutation.isPending || !password}
                            >
                                {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Password Confirmation */}
            <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Password?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change your password? You will need to use the new password for future logins.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPasswordUpdate}>
                            Confirm Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
}
