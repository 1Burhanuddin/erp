import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Palette } from "lucide-react";

const Settings = () => {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">First Name</Label>
              <Input id="firstName" defaultValue="John" className="bg-surface border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
              <Input id="lastName" defaultValue="Doe" className="bg-surface border-border" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" className="bg-surface border-border" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Order Updates</p>
                <p className="text-sm text-muted-foreground">Get notified when orders change status</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Receive alerts when inventory is low</p>
              </div>
              <Switch />
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
              <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
              <Input id="currentPassword" type="password" className="bg-surface border-border max-w-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <Input id="newPassword" type="password" className="bg-surface border-border max-w-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" className="bg-surface border-border max-w-md" />
            </div>
            <Button variant="outline">Update Password</Button>
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