import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AppSettings() {
    const navigate = useNavigate();
    const { theme, setTheme, color, setColor } = useTheme();
    const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
    const updateBusinessProfileMutation = useUpdateBusinessProfile();

    const [businessForm, setBusinessForm] = useState({
        timezone: "UTC",
        currency: "INR"
    });

    useEffect(() => {
        if (businessProfile) {
            setBusinessForm({
                timezone: businessProfile.timezone || "UTC",
                currency: businessProfile.currency || "INR"
            });
        }
    }, [businessProfile]);

    const handleUpdate = (field: string, value: string) => {
        if (!businessProfile) return;
        const newForm = { ...businessForm, [field]: value };
        setBusinessForm(newForm);

        // Auto-save for these settings or add a save button?
        // Let's auto-save for UX since these are dropdowns/selections
        const payload = { ...businessProfile, ...newForm };
        updateBusinessProfileMutation.mutate(payload as any, {
            onSuccess: () => toast.success("Settings updated")
        });
    };

    return (
        <PageLayout>
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Application Settings</h1>
                    <p className="text-muted-foreground">Configure timezone, currency, and appearance.</p>
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Appearance & Locale
                        </CardTitle>
                        <CardDescription>Customize how the app looks and behaves.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Interface Theme</Label>
                                    <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
                                        {["light", "dark", "system"].map((t) => (
                                            <Button
                                                key={t}
                                                variant={theme === t ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setTheme(t as any)}
                                                className="capitalize"
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Accent Color</Label>
                                    <div className="flex gap-3">
                                        {[
                                            { name: "blue", color: "#2563eb" },
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
                                                    "h-8 w-8 rounded-full ring-offset-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 disabled:opacity-50",
                                                    color === name ? "ring-2 ring-primary scale-110" : "ring-transparent group-hover:ring-2",
                                                    "border border-white/20 shadow-sm"
                                                )}
                                                style={{ backgroundColor: bg }}
                                                title={name.charAt(0).toUpperCase() + name.slice(1)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select
                                    value={businessForm.timezone}
                                    onValueChange={(val) => handleUpdate("timezone", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                        <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                                        <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                                        <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={businessForm.currency}
                                    onValueChange={(val) => handleUpdate("currency", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                        <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
