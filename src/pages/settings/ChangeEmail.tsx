import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateEmail } from "@/api/profile";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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

export default function ChangeEmail() {
    const [currentEmail, setCurrentEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const updateEmailMutation = useUpdateEmail();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setCurrentEmail(user.email);
            if (user?.new_email) setPendingEmail(user.new_email);
        };
        getUser();
    }, []);

    const initiateUpdate = () => {
        if (!newEmail) {
            toast.error("Please enter a new email address");
            return;
        }
        if (newEmail === currentEmail) {
            toast.error("New email is the same as current email");
            return;
        }
        setIsDialogOpen(true);
    };

    const confirmUpdate = () => {
        updateEmailMutation.mutate(newEmail, {
            onSuccess: () => {
                setNewEmail("");
                setIsDialogOpen(false);
            }
        });
    };

    return (
        <PageLayout>
            <div className="space-y-6 w-full mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Email Address</CardTitle>
                        <CardDescription>Update your contact email. You may need to verify the new address.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="bg-amber-500/15 border border-amber-500/20 rounded-md p-3 flex gap-3 items-start text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold">Important: This changes your login!</p>
                                <p className="opacity-90">Your email is your username. After changing it, you must use the <strong>new email</strong> to sign in.</p>
                            </div>
                        </div>

                        {pendingEmail && (
                            <div className="bg-blue-500/15 border border-blue-500/20 rounded-md p-3 flex gap-3 items-start text-blue-600 dark:text-blue-400">
                                <Mail className="h-5 w-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold">Verification Pending</p>
                                    <p className="opacity-90">
                                        We have sent a confirmation link to <strong>{pendingEmail}</strong>.
                                        Please check your inbox (and spam folder) to verify this change.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Email</Label>
                                <div className="p-2 border rounded-md bg-muted/50 text-foreground min-h-[40px] flex items-center px-3 opacity-70 cursor-not-allowed">
                                    <Mail className="mr-2 h-4 w-4 opacity-50" />
                                    {currentEmail || "Loading..."}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newEmail">New Email</Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="enter@new.email"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={initiateUpdate}
                                disabled={updateEmailMutation.isPending || !newEmail || !currentEmail}
                            >
                                {updateEmailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Email
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Email?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change your email to <strong>{newEmail}</strong>?
                            <br /><br />
                            You may receive a confirmation link at the new address.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUpdate}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
}
