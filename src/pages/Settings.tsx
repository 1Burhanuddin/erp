
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUpdateProfile, useUpdatePassword } from "@/api/profile";

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();

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
    updateProfileMutation.mutate({ full_name: fullName });
  };

  const handlePasswordUpdate = () => {
    if (password !== confirmPassword) {
      // toast error handled by hook? No, we should check here.
      // But for now let's just return. ideally show toast.
      alert("Passwords do not match"); // Quick fallback
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    updatePasswordMutation.mutate(password, {
      onSuccess: () => {
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  if (loading) {
    return <PageLayout><PageHeader title="Settings" description="Loading..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="max-w-3xl space-y-6">
        {/* Profile Section */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-surface border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted border-border cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleProfileUpdate}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Notifications Section - Static for now */}
        <Card className="p-4 md:p-6 bg-card border-border opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications (Coming Soon)</h2>
          </div>
          <div className="space-y-4 pointer-events-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface border-border max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-surface border-border max-w-md"
              />
            </div>
            <Button
              variant="outline"
              onClick={handlePasswordUpdate}
              disabled={updatePasswordMutation.isPending || !password}
            >
              {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch />
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Settings;