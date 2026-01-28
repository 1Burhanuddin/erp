import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStores, useUpdateStore, useCreateStore } from "@/api/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Building2, LayoutDashboard, MapPin, Map } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { LocationPicker } from "@/components/shared/LocationPicker";

const SetupWizard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: stores, isLoading: isLoadingStores } = useStores();
    const updateStore = useUpdateStore();
    const createStore = useCreateStore();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        gstin: "",
        currency: "INR",
        website: "",
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const currentStore = stores?.[0];

    useEffect(() => {
        if (currentStore) {
            setFormData(prev => ({
                ...prev,
                name: currentStore.name || "",
                address: currentStore.address || "",
                phone: currentStore.phone || "",
                email: currentStore.email || "",
                gstin: currentStore.gstin || "",
                currency: currentStore.currency || "INR",
                website: currentStore.website || "",
                latitude: currentStore.latitude || null,
                longitude: currentStore.longitude || null,
            }));
        } else if (user) {
            // Pre-fill from auth for new stores
            setFormData(prev => ({
                ...prev,
                name: user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Business` : "",
                email: user.email || "",
                phone: user.phone || "",
            }));
        }
    }, [currentStore, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFinish = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast({
                title: "Required Field",
                description: "Please enter your Business Name.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            toast({
                title: "Location Required",
                description: "Please pin your business location on the map. This is required for attendance geofencing.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (currentStore) {
                const updatedStore = await updateStore.mutateAsync({
                    id: currentStore.id,
                    ...formData,
                    onboarding_completed: true
                });

                // Optimistically update cache to prevent the dashboard from redirecting back to /setup
                queryClient.setQueryData(["stores"], [updatedStore]);
            } else {
                const newStore = await createStore.mutateAsync({
                    ...formData,
                });

                // For new stores, we also force the onboarding status in cache
                queryClient.setQueryData(["stores"], [{ ...newStore, onboarding_completed: true }]);
            }

            toast({
                title: "Setup Complete!",
                description: "Welcome to your new dashboard.",
            });

            navigate("/");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    if (isLoadingStores) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
            <div className="w-full max-w-2xl space-y-8 animate-enter">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Setup Your Business</h1>
                    <p className="text-slate-500 dark:text-slate-400">Complete these few details to get started with your ERP.</p>
                </div>

                <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:border">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Building2 className="h-5 w-5 text-primary" />
                            Business Profile
                        </CardTitle>
                        <CardDescription>
                            Only name and currency are required. All other fields are optional.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleFinish}>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Business Name <span className="text-destructive font-bold">*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Acme Corporation"
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency" className="text-sm font-semibold">Base Currency <span className="text-destructive font-bold">*</span></Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(val) => handleSelectChange("currency", val)}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                                            <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                            <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-semibold">Business Address (Optional)</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="123 Business St, City, State"
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold">Business Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">Business Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@company.com"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="gstin" className="text-sm font-semibold">GSTIN / Tax ID (Optional)</Label>
                                    <Input
                                        id="gstin"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        placeholder="e.g. 29ABCDE1234F1Z5"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website" className="text-sm font-semibold">Website (Optional)</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://acme.com"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-bold flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Business Location <span className="text-destructive font-bold">*</span>
                                    </Label>
                                </div>
                                <div className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
                                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Map className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">How to locate?</span> Pin your exact shop/business location on the map above.
                                            <br />
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Tip:</span> If you cannot find it, go to Google Maps, long-press on your location, and copy the coordinates into the boxes below.
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <LocationPicker
                                            value={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
                                            onChange={(pos) => setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10 flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    You can update these details anytime from the **Settings** menu later. Let's get started!
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-6 rounded-b-xl">
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
                                disabled={updateStore.isPending || createStore.isPending}
                            >
                                {(updateStore.isPending || createStore.isPending) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <LayoutDashboard className="h-5 w-5" />
                                )}
                                Start Managing Your Business
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default SetupWizard;
