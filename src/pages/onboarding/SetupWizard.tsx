import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStores, useUpdateStore } from "@/api/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Building2, Phone, Coins } from "lucide-react";

const SetupWizard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: stores, isLoading: isLoadingStores } = useStores();
    const updateStore = useUpdateStore();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        gstin: "",
        currency: "INR",
        website: "",
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
            }));
        }
    }, [currentStore]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Final Step - Submit
            if (!currentStore) return;

            try {
                await updateStore.mutateAsync({
                    id: currentStore.id,
                    ...formData,
                    onboarding_completed: true
                });

                toast({
                    title: "Setup Complete!",
                    description: "Your business profile is ready.",
                });

                navigate("/");
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    };

    if (isLoadingStores) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to ERP System</h1>
                    <p className="text-muted-foreground mt-2">Let's get your business set up in a few steps.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {step === 1 && <Building2 className="h-5 w-5 text-primary" />}
                            {step === 2 && <Phone className="h-5 w-5 text-primary" />}
                            {step === 3 && <Coins className="h-5 w-5 text-primary" />}

                            {step === 1 && "Business Details"}
                            {step === 2 && "Contact Info"}
                            {step === 3 && "Regional Settings"}
                        </CardTitle>
                        <CardDescription>
                            Step {step} of 3
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Business Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="My Company"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gstin">Tax ID / GSTIN (Optional)</Label>
                                    <Input
                                        id="gstin"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        placeholder="e.g. 29ABCDE1234F1Z5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website (Optional)</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address (Optional)</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="123 Business St, City"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Business Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@business.com"
                                    />
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(val) => handleSelectChange("currency", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">INR (₹)</SelectItem>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="AED">AED (د.إ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4 border border-green-100 flex items-start gap-3 mt-4">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div className="text-sm text-green-800">
                                        You're all set! Click "Finish" to enter your dashboard and start managing your business.
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1}
                        >
                            Back
                        </Button>
                        <Button onClick={handleNext} disabled={updateStore.isPending}>
                            {updateStore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {step === 3 ? "Finish & Go to Dashboard" : "Next"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default SetupWizard;
