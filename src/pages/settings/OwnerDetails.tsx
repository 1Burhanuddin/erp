import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { toast } from "sonner";
import { SettingsField, BusinessActionButtons } from "@/components/settings/SettingsCommon";
import { useNavigate } from "react-router-dom";

export default function OwnerDetails() {
    const navigate = useNavigate();
    const { data: businessProfile, isLoading: isBusinessLoading } = useBusinessProfile();
    const updateBusinessProfileMutation = useUpdateBusinessProfile();
    const [isEditingBusiness, setIsEditingBusiness] = useState(false);

    const [businessForm, setBusinessForm] = useState({
        owner_name: "",
        owner_phone: "",
        owner_email: "",
    });

    useEffect(() => {
        if (businessProfile) {
            setBusinessForm({
                owner_name: businessProfile.owner_name || "",
                owner_phone: businessProfile.owner_phone || "",
                owner_email: businessProfile.owner_email || "",
            });
        }
    }, [businessProfile]);

    const handleBusinessUpdate = () => {
        if (!businessProfile) return;
        const payload = { ...businessProfile, ...businessForm };
        updateBusinessProfileMutation.mutate(payload as any, {
            onSuccess: () => {
                setIsEditingBusiness(false);
                toast.success("Owner details updated");
            }
        });
    };

    const handleChange = (field: string, value: string) => {
        setBusinessForm(prev => ({ ...prev, [field]: value }));
    };

    if (isBusinessLoading) {
        return <PageLayout><div className="p-8">Loading...</div></PageLayout>;
    }

    return (
        <PageLayout>
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Owner Information</h1>
                    <p className="text-muted-foreground">Details of the primary business owner.</p>
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Owner Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <SettingsField
                                label="Owner Name"
                                value={businessForm.owner_name}
                                onChange={(val) => handleChange("owner_name", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Owner Phone"
                                value={businessForm.owner_phone}
                                onChange={(val) => handleChange("owner_phone", val)}
                                isEditing={isEditingBusiness}
                            />
                            <SettingsField
                                label="Owner Email"
                                value={businessForm.owner_email}
                                onChange={(val) => handleChange("owner_email", val)}
                                isEditing={isEditingBusiness}
                            />
                        </div>
                        <BusinessActionButtons
                            isEditing={isEditingBusiness}
                            onEdit={() => setIsEditingBusiness(true)}
                            onCancel={() => setIsEditingBusiness(false)}
                            onSave={handleBusinessUpdate}
                            isPending={updateBusinessProfileMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
