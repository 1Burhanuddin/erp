import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Users, ArrowLeft, Edit, X, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/api/businessProfile";
import { toast } from "sonner";
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
        if (businessProfile && !isEditingBusiness) {
            setBusinessForm({
                owner_name: businessProfile.owner_name || "",
                owner_phone: businessProfile.owner_phone || "",
                owner_email: businessProfile.owner_email || "",
            });
        }
    }, [businessProfile, isEditingBusiness]);

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
        return <PageLayout><PageHeader title="Owner Information" description="Loading..." /></PageLayout>;
    }

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    <Users className="h-8 w-8" />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-xl">{businessForm.owner_name || "Owner Name"}</CardTitle>
                                    <CardDescription>{businessForm.owner_email || "Email Not Set"}</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => isEditingBusiness ? setIsEditingBusiness(false) : setIsEditingBusiness(true)}
                                disabled={updateBusinessProfileMutation.isPending}
                            >
                                {isEditingBusiness ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FloatingLabelInput
                                    id="owner_name"
                                    label="Owner Name"
                                    value={businessForm.owner_name}
                                    onChange={(e) => handleChange("owner_name", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FloatingLabelInput
                                    id="owner_phone"
                                    label="Owner Phone"
                                    value={businessForm.owner_phone}
                                    onChange={(e) => handleChange("owner_phone", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <FloatingLabelInput
                                    id="owner_email"
                                    label="Owner Email"
                                    value={businessForm.owner_email}
                                    onChange={(e) => handleChange("owner_email", e.target.value)}
                                    disabled={!isEditingBusiness}
                                    className={!isEditingBusiness ? "bg-muted/50 border-none text-foreground disabled:opacity-100 font-medium" : ""}
                                    labelClassName={!isEditingBusiness ? "bg-transparent" : ""}
                                />
                            </div>
                        </div>

                        {isEditingBusiness && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleBusinessUpdate} disabled={updateBusinessProfileMutation.isPending}>
                                    {updateBusinessProfileMutation.isPending ? (
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
