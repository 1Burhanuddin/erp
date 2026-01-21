import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { toast } from "sonner";
import { SettingsField, BusinessActionButtons } from "@/components/settings/SettingsCommon";
import { useNavigate } from "react-router-dom";

export default function BusinessDetails() {
    const navigate = useNavigate();
    const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
    const updateBusinessProfileMutation = useUpdateBusinessProfile();
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

    useEffect(() => {
        if (businessProfile) {
            resetBusinessForm();
        }
    }, [businessProfile]);

    const resetBusinessForm = () => {
        if (businessProfile) {
            setBusinessForm({
                company_name: businessProfile.company_name || "",
                address: businessProfile.address || "",
                state: businessProfile.state || "",
                phone: businessProfile.phone || "",
                email: businessProfile.email || "",
                website: businessProfile.website || "",
                gstin: businessProfile.gstin || "",
                pan_no: businessProfile.pan_no || "",
                company_type: businessProfile.company_type || "",
            });
        }
    };

    const handleBusinessUpdate = () => {
        // Only send updated fields related to this page, but API might expect full object?
        // Based on previous code, it sends the whole form. Ideally we should send what we have + existing.
        // The previous code sent `businessForm` cast as `any`.
        // Let's create a full payload by merging existing profile with current form.
        if (!businessProfile) return;

        const payload = { ...businessProfile, ...businessForm };

        updateBusinessProfileMutation.mutate(payload as any, {
            onSuccess: () => {
                setIsEditingBusiness(false);
                toast.success("Business details updated successfully");
            }
        });
    };

    const handleCancelBusinessEdit = () => {
        setIsEditingBusiness(false);
        resetBusinessForm();
    };

    const handleChange = (field: string, value: string) => {
        setBusinessForm(prev => ({ ...prev, [field]: value }));
    };

    if (isBusinessLoading) {
        return <PageLayout><PageHeader title="Business Details" description="Loading..." /></PageLayout>;
    }

    return (
        <PageLayout>
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Business Details</h1>
                    <p className="text-muted-foreground">These details will appear on your invoices.</p>
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Company Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <SettingsField
                                label="Company Name"
                                value={businessForm.company_name}
                                onChange={(val) => handleChange("company_name", val)}
                                placeholder="Enter company name"
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Company Type"
                                value={businessForm.company_type}
                                onChange={(val) => handleChange("company_type", val)}
                                placeholder="e.g. Private Limited, Proprietorship"
                                isEditing={isEditingBusiness}
                            />
                            <div className="md:col-span-2">
                                <SettingsField
                                    label="Address"
                                    value={businessForm.address}
                                    onChange={(val) => handleChange("address", val)}
                                    placeholder="Full business address"
                                    isEditing={isEditingBusiness}
                                />
                            </div>
                            <SettingsField
                                label="State"
                                value={businessForm.state}
                                onChange={(val) => handleChange("state", val)}
                                placeholder="State (e.g. Maharashtra)"
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Phone"
                                value={businessForm.phone}
                                onChange={(val) => handleChange("phone", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Business Email"
                                value={businessForm.email}
                                onChange={(val) => handleChange("email", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Website"
                                value={businessForm.website}
                                onChange={(val) => handleChange("website", val)}
                                placeholder="https://..."
                                isEditing={isEditingBusiness}
                            />
                        </div>
                        <BusinessActionButtons
                            isEditing={isEditingBusiness}
                            onEdit={() => setIsEditingBusiness(true)}
                            onCancel={handleCancelBusinessEdit}
                            onSave={handleBusinessUpdate}
                            isPending={updateBusinessProfileMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
