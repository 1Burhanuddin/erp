import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, Edit, X, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { useStores, useUpdateStore } from "@/api/stores";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function BusinessDetails() {
    const navigate = useNavigate();
    const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
    const { data: stores, isLoading: isStoresLoading } = useStores();

    const updateBusinessProfileMutation = useUpdateBusinessProfile();
    const updateStoreMutation = useUpdateStore();

    const [isEditingBusiness, setIsEditingBusiness] = useState(false);

    const [businessForm, setBusinessForm] = useState({
        company_name: "",
        address: "",
        state: "",
        phone: "",
        email: "",
        website: "",
        gstin: "",
        pan_no: "",
        company_type: "",
    });

    const currentStore = stores?.[0];

    useEffect(() => {
        if (!isEditingBusiness) {
            // Prioritize Store data for shared fields, fallback to BusinessProfile
            // BusinessProfile is master for specialized fields (pan, state, company_type)
            setBusinessForm({
                company_name: currentStore?.name || businessProfile?.company_name || "",
                address: currentStore?.address || businessProfile?.address || "",
                phone: currentStore?.phone || businessProfile?.phone || "",
                email: currentStore?.email || businessProfile?.email || "",
                website: currentStore?.website || businessProfile?.website || "",
                gstin: currentStore?.gstin || businessProfile?.gstin || "",

                state: businessProfile?.state || "",
                pan_no: businessProfile?.pan_no || "",
                company_type: businessProfile?.company_type || "",
            });
        }
    }, [businessProfile, currentStore, isEditingBusiness]);

    const handleBusinessUpdate = async () => {
        const payload = { ...businessProfile, ...businessForm };

        try {
            // 1. Update Business Profile (Always)
            updateBusinessProfileMutation.mutate(payload as any, {
                onSuccess: () => {
                    if (!currentStore) {
                        setIsEditingBusiness(false);
                        toast.success("Business details updated successfully");
                    }
                },
                onError: (err) => {
                    toast.error("Failed to update profile: " + err.message);
                }
            });

            // 2. Update Store (If exists)
            if (currentStore) {
                await updateStoreMutation.mutateAsync({
                    id: currentStore.id,
                    name: businessForm.company_name,
                    address: businessForm.address,
                    phone: businessForm.phone,
                    email: businessForm.email,
                    website: businessForm.website,
                    gstin: businessForm.gstin
                });
                // If both succeed (or store succeeds)
                setIsEditingBusiness(false);
                toast.success("Business & Store details updated successfully");
            }

        } catch (error: any) {
            toast.error("Error updating details: " + error.message);
        }
    };

    const handleCancelBusinessEdit = () => {
        setIsEditingBusiness(false);
        // Form will reset via useEffect
    };

    const handleChange = (field: string, value: string) => {
        setBusinessForm(prev => ({ ...prev, [field]: value }));
    };

    if (isBusinessLoading || isStoresLoading) {
        return <PageLayout><PageHeader title="Business Details" description="Loading..." /></PageLayout>;
    }

    const businessInitial = businessForm.company_name?.charAt(0).toUpperCase() || "B";

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl">
                {/* Business Information Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-xl">{businessForm.company_name || "Business Name"}</CardTitle>
                                    <CardDescription>{businessForm.company_type || "Company Type Not Set"}</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => isEditingBusiness ? handleCancelBusinessEdit() : setIsEditingBusiness(true)}
                                disabled={updateBusinessProfileMutation.isPending || updateStoreMutation.isPending}
                            >
                                {isEditingBusiness ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="company_name"
                                    label="Company Name"
                                    value={businessForm.company_name}
                                    onChange={(e) => handleChange("company_name", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="company_type"
                                    label="Company Type"
                                    value={businessForm.company_type}
                                    onChange={(e) => handleChange("company_type", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <FloatingLabelInput
                                    id="address"
                                    label="Address"
                                    value={businessForm.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="state"
                                    label="State"
                                    value={businessForm.state}
                                    onChange={(e) => handleChange("state", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="phone"
                                    label="Phone"
                                    value={businessForm.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="email"
                                    type="email"
                                    label="Business Email"
                                    value={businessForm.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="website"
                                    label="Website"
                                    value={businessForm.website}
                                    onChange={(e) => handleChange("website", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="gstin"
                                    label="GSTIN"
                                    value={businessForm.gstin}
                                    onChange={(e) => handleChange("gstin", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="pan_no"
                                    label="PAN Number"
                                    value={businessForm.pan_no}
                                    onChange={(e) => handleChange("pan_no", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted border-none text-foreground" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>
                        </div>

                        {isEditingBusiness && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleBusinessUpdate} disabled={updateBusinessProfileMutation.isPending || updateStoreMutation.isPending}>
                                    {(updateBusinessProfileMutation.isPending || updateStoreMutation.isPending) ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
